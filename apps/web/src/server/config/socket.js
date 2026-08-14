import crypto from "node:crypto";
import { Server } from "socket.io";
import { z } from "zod";
import Appointment from "../models/appointment.model.js";
import Consent from "../models/consent.model.js";
import Doctor from "../models/doctor.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import { findSession, SESSION_COOKIE } from "../utils/session.js";
import { verifyRoomGrant } from "../utils/roomGrant.js";
import { isTelehealthWindowOpen, TELEHEALTH_POLICY_VERSION } from "../utils/telehealth.js";
import { socketCorrelationId, writeSocketAudit } from "../utils/socketAudit.js";

let io;
const MAX_EVENT_BYTES = 90_000;
const MAX_CONNECTIONS_PER_IP = 60;
const connectionAttempts = new Map();
const activeGrantNonces = new Map();

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const roomId = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);
const grant = z.string().min(50).max(900);
const queueJoinSchema = z.object({ appointmentId: objectId }).strict();
const clinicJoinSchema = z.object({ clinicId: objectId }).strict();
const doctorJoinSchema = z.object({ doctorId: objectId }).strict();
const telehealthJoinSchema = z.object({ roomId, grant }).strict();
const leaveSchema = z.object({ roomId }).strict();
const offerSchema = z.object({ roomId, offer: z.object({ type: z.enum(["offer", "answer"]), sdp: z.string().min(1).max(70_000) }).strict() }).strict();
const answerSchema = z.object({ roomId, answer: z.object({ type: z.enum(["offer", "answer"]), sdp: z.string().min(1).max(70_000) }).strict() }).strict();
const candidateSchema = z.object({ roomId, candidate: z.object({
  candidate: z.string().max(20_000).optional(),
  sdpMid: z.string().max(200).nullable().optional(),
  sdpMLineIndex: z.number().int().min(0).max(100).nullable().optional(),
  usernameFragment: z.string().max(200).optional(),
}).strict() }).strict();

const cookieToken = (cookieHeader = "") => cookieHeader
  .split(";")
  .map((part) => part.trim().split("="))
  .find(([name]) => name === SESSION_COOKIE)?.[1];

const allowedOrigins = () => new Set([
  process.env.CLIENT_URL || "http://localhost:3000",
  ...(process.env.ADDITIONAL_CLIENT_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
].map((origin) => origin.replace(/\/$/, "")));

const requestAddress = (request) => String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();

const connectionAllowed = (request) => {
  const key = requestAddress(request);
  const now = Date.now();
  const current = connectionAttempts.get(key);
  if (!current || now - current.startedAt > 15 * 60 * 1000) {
    connectionAttempts.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_CONNECTIONS_PER_IP;
};

const authorizeAppointment = async (user, appointment) => {
  if (!user.emailVerifiedAt) return false;
  if (user.role === "admin") return true;
  if (appointment.patientId.toString() === user.id) return true;
  if (user.role !== "doctor" || !user.emailVerifiedAt) return false;
  const doctor = await Doctor.findOne({ userId: user.id, "verification.status": "approved" }).select("_id").lean();
  return doctor?._id.toString() === appointment.doctorId.toString();
};

const verifiedDoctorForAppointment = async (user, appointment) => {
  if (user.role !== "doctor" || !user.emailVerifiedAt) return false;
  const doctor = await Doctor.findOne({
    _id: appointment.doctorId,
    userId: user.id,
    "verification.status": "approved",
  }).select("_id userId verification.status").lean();
  return Boolean(doctor);
};

const emitReject = (socket, event, message = "Not authorized") => {
  socket.emit("room-error", { event, message, correlationId: socket.data.correlationId });
};

const eventBudget = (socket, kind, limit, windowMs = 10_000) => {
  const now = Date.now();
  const current = socket.data.eventWindows[kind];
  if (!current || now - current.startedAt > windowMs) {
    socket.data.eventWindows[kind] = { startedAt: now, count: 1 };
    return true;
  }
  current.count += 1;
  return current.count <= limit;
};

const parseEvent = (socket, event, schema, payload) => {
  let size = 0;
  try { size = Buffer.byteLength(JSON.stringify(payload)); } catch { size = MAX_EVENT_BYTES + 1; }
  if (size > MAX_EVENT_BYTES || !eventBudget(socket, "malformed", 12)) {
    emitReject(socket, event, "Invalid or oversized event");
    writeSocketAudit(socket, "telehealth-event", "blocked", { event, reason: "malformed-or-oversized" });
    if (!eventBudget(socket, "disconnect", 3, 60_000)) socket.disconnect(true);
    return null;
  }
  const result = schema.safeParse(payload);
  if (!result.success) {
    emitReject(socket, event, "Invalid event payload");
    writeSocketAudit(socket, "telehealth-event", "blocked", { event, reason: "schema" });
    return null;
  }
  return result.data;
};

const liveSession = async (socket) => {
  const session = await Session.findOne({
    _id: socket.data.sessionId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("_id").lean();
  if (session) return true;
  emitReject(socket, "session", "Session expired or revoked");
  socket.disconnect(true);
  return false;
};

const appointmentFromGrant = async (socket, data) => {
  const grantData = verifyRoomGrant(data.grant);
  if (!grantData || grantData.userId !== socket.data.user.id || grantData.role !== socket.data.user.role || grantData.roomId !== data.roomId) {
    writeSocketAudit(socket, "telehealth-join", "blocked", { event: "join-telehealth-room", roomId: data.roomId, reason: "invalid-grant" });
    return null;
  }
  const appointment = await Appointment.findOne({
    _id: grantData.appointmentId,
    telehealthRoomId: data.roomId,
    consultationType: "video",
  }).select("patientId doctorId clinicId date slotTime status telehealthRoomId telehealthGrantVersion").lean();
  if (!appointment || appointment.telehealthGrantVersion !== grantData.grantVersion || !isTelehealthWindowOpen(appointment)) return null;
  if (socket.data.user.role === "doctor") {
    if (!(await verifiedDoctorForAppointment(socket.data.user, appointment))) return null;
  } else if (socket.data.user.role === "patient" && appointment.patientId.toString() !== socket.data.user.id) {
    return null;
  } else if (socket.data.user.role !== "patient") {
    return null;
  }
  const consent = await Consent.findOne({ userId: socket.data.user.id, type: "telehealth" })
    .sort({ createdAt: -1 }).select("accepted policyVersion").lean();
  if (!consent?.accepted || consent.policyVersion !== TELEHEALTH_POLICY_VERSION) return null;
  return { appointment, grantData };
};

export const initSocket = (server) => {
  const clientOrigins = allowedOrigins();
  io = new Server(server, {
    cors: { origin: [...clientOrigins], methods: ["GET", "POST"], credentials: true },
    maxHttpBufferSize: MAX_EVENT_BYTES,
    perMessageDeflate: false,
    allowRequest: (request, callback) => {
      const origin = request.headers.origin;
      callback(null, connectionAllowed(request) && (!origin || clientOrigins.has(origin.replace(/\/$/, ""))));
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = cookieToken(socket.handshake.headers.cookie);
      if (!token) return next(new Error("Authentication required"));
      const session = await findSession(decodeURIComponent(token));
      if (!session || session.mfaEnrollmentRequired) return next(new Error("Authentication required"));
      const user = await User.findOne({ _id: session.userId, status: "active" }).select("_id name role emailVerifiedAt").lean();
      if (!user) return next(new Error("Authentication required"));
      socket.data.user = { id: user._id.toString(), name: user.name, role: user.role, emailVerifiedAt: user.emailVerifiedAt };
      socket.data.sessionId = session._id.toString();
      socket.data.correlationId = socketCorrelationId();
      socket.data.telehealthRooms = new Map();
      socket.data.queueRooms = new Set();
      socket.data.eventWindows = {};
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`session-${socket.data.sessionId}`);
    socket.join(`user-${socket.data.user.id}`);

    socket.on("join-queue", async (payload) => {
      if (!(await liveSession(socket))) return;
      const data = parseEvent(socket, "join-queue", queueJoinSchema, payload);
      if (!data || !eventBudget(socket, "join", 20)) return emitReject(socket, "join-queue", "Join rate exceeded");
      try {
        const appointment = await Appointment.findById(data.appointmentId).select("patientId doctorId").lean();
        if (!appointment || !(await authorizeAppointment(socket.data.user, appointment))) {
          emitReject(socket, "join-queue");
          return writeSocketAudit(socket, "queue-join", "blocked", { event: "join-queue", reason: "scope" });
        }
        socket.join(`appointment-${appointment._id}`);
        socket.data.queueRooms.add(appointment._id.toString());
        writeSocketAudit(socket, "queue-join", "success", { event: "join-queue" });
      } catch {
        emitReject(socket, "join-queue", "Invalid appointment");
      }
    });

    socket.on("join-clinic", async (payload) => {
      if (!(await liveSession(socket))) return;
      const data = parseEvent(socket, "join-clinic", clinicJoinSchema, payload);
      if (!data || !eventBudget(socket, "join", 20)) return emitReject(socket, "join-clinic", "Join rate exceeded");
      try {
        const user = socket.data.user;
        if (user.role === "admin") return socket.join(`clinic-${data.clinicId}`);
        const doctor = user.role === "doctor" && user.emailVerifiedAt && await Doctor.findOne({ userId: user.id, clinicId: data.clinicId, "verification.status": "approved" }).select("_id").lean();
        if (!doctor) return emitReject(socket, "join-clinic");
        socket.join(`clinic-${data.clinicId}`);
      } catch { emitReject(socket, "join-clinic", "Invalid clinic"); }
    });

    socket.on("join-doctor", async (payload) => {
      if (!(await liveSession(socket))) return;
      const data = parseEvent(socket, "join-doctor", doctorJoinSchema, payload);
      if (!data || !eventBudget(socket, "join", 20)) return emitReject(socket, "join-doctor", "Join rate exceeded");
      try {
        const user = socket.data.user;
        if (user.role === "admin") return socket.join(`doctor-${data.doctorId}`);
        const doctor = user.role === "doctor" && user.emailVerifiedAt && await Doctor.findOne({ _id: data.doctorId, userId: user.id, "verification.status": "approved" }).select("_id").lean();
        if (!doctor) return emitReject(socket, "join-doctor");
        socket.join(`doctor-${data.doctorId}`);
      } catch { emitReject(socket, "join-doctor", "Invalid clinician"); }
    });

    socket.on("join-telehealth-room", async (payload) => {
      if (!(await liveSession(socket))) return;
      const data = parseEvent(socket, "join-telehealth-room", telehealthJoinSchema, payload);
      if (!data || !eventBudget(socket, "join", 10)) return emitReject(socket, "join-telehealth-room", "Join rate exceeded");
      try {
        if (socket.data.telehealthRooms.has(data.roomId)) return emitReject(socket, "join-telehealth-room", "Already joined");
        const authorized = await appointmentFromGrant(socket, data);
        if (!authorized) return emitReject(socket, "join-telehealth-room", "Room access is invalid or expired");
        const room = `telehealth-${data.roomId}`;
        const participants = await io.in(room).fetchSockets();
        if (participants.length >= 2) return emitReject(socket, "join-telehealth-room", "Room is full");
        if (activeGrantNonces.has(authorized.grantData.nonce)) return emitReject(socket, "join-telehealth-room", "Room grant is already in use");
        activeGrantNonces.set(authorized.grantData.nonce, socket.id);
        const participantSummary = participants.map((participant) => ({ name: participant.data.user.name, role: participant.data.user.role }));
        socket.join(room);
        socket.data.telehealthRooms.set(data.roomId, { appointmentId: authorized.appointment._id.toString(), role: socket.data.user.role, grantNonce: authorized.grantData.nonce });
        const currentParticipants = [...participantSummary, { name: socket.data.user.name, role: socket.data.user.role }];
        socket.to(room).emit("telehealth-peer-joined", { name: socket.data.user.name, role: socket.data.user.role });
        io.to(room).emit("telehealth-room-state", {
          participantCount: currentParticipants.length,
          clinicianPresent: currentParticipants.some((participant) => participant.role === "doctor"),
          participants: currentParticipants.map(({ name, role }) => ({ name, role })),
        });
        writeSocketAudit(socket, "telehealth-join", "success", { event: "join-telehealth-room", roomId: data.roomId });
        if (currentParticipants.length === 2 && currentParticipants.some((participant) => participant.role === "doctor")) {
          await Appointment.updateOne({ _id: authorized.appointment._id, status: { $in: ["booked", "waiting"] } }, { $set: { status: "in-progress", consultationStartTime: new Date() } });
          io.to(room).emit("telehealth-call-started");
          writeSocketAudit(socket, "telehealth-call", "success", { event: "start", roomId: data.roomId });
        }
      } catch { emitReject(socket, "join-telehealth-room", "Room authorization failed"); }
    });

    const relay = (event, field, schema) => {
      socket.on(event, async (payload) => {
        if (!(await liveSession(socket))) return;
        const data = parseEvent(socket, event, schema, payload);
        if (!data || !eventBudget(socket, "signal", 120)) return emitReject(socket, event, "Signaling rate exceeded");
        const membership = socket.data.telehealthRooms.get(data.roomId);
        if (!membership) return emitReject(socket, event, "Join the authorized room first");
        socket.to(`telehealth-${data.roomId}`).emit(event, { [field]: data[field] });
      });
    };
    relay("telehealth-offer", "offer", offerSchema);
    relay("telehealth-answer", "answer", answerSchema);
    relay("telehealth-ice-candidate", "candidate", candidateSchema);

    socket.on("leave-telehealth-room", async (payload) => {
      if (!(await liveSession(socket))) return;
      const data = parseEvent(socket, "leave-telehealth-room", leaveSchema, payload);
      if (!data) return;
      const membership = socket.data.telehealthRooms.get(data.roomId);
      if (!membership) return emitReject(socket, "leave-telehealth-room", "Room membership not found");
      const room = `telehealth-${data.roomId}`;
      socket.to(room).emit("telehealth-peer-left");
      socket.leave(room);
      socket.data.telehealthRooms.delete(data.roomId);
      activeGrantNonces.delete(membership.grantNonce);
      writeSocketAudit(socket, "telehealth-leave", "success", { event: "leave-telehealth-room", roomId: data.roomId });
      const remaining = await io.in(room).fetchSockets();
      if (!remaining.length) {
        await Appointment.updateOne({ _id: membership.appointmentId, consultationEndTime: { $exists: false } }, { $set: { consultationEndTime: new Date() } });
        writeSocketAudit(socket, "telehealth-call", "success", { event: "end", roomId: data.roomId });
      }
    });

    socket.on("disconnecting", () => {
      for (const [roomId, membership] of socket.data.telehealthRooms.entries()) {
        socket.to(`telehealth-${roomId}`).emit("telehealth-peer-left");
        writeSocketAudit(socket, "telehealth-leave", "success", { event: "disconnect", roomId });
        activeGrantNonces.delete(membership.grantNonce);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const disconnectSession = (sessionId) => {
  if (io && sessionId) io.in(`session-${sessionId}`).disconnectSockets(true);
};

export const disconnectUserSessions = (userId) => {
  if (io && userId) io.in(`user-${userId}`).disconnectSockets(true);
};
