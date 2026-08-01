import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join room for specific appointment updates
    socket.on("join-queue", (appointmentId) => {
      socket.join(`appointment-${appointmentId}`);
      console.log(`Socket ${socket.id} joined appointment-${appointmentId}`);
    });

    // Join room for clinic/doctor updates (e.g. queue display board)
    socket.on("join-clinic", (clinicId) => {
      socket.join(`clinic-${clinicId}`);
      console.log(`Socket ${socket.id} joined clinic-${clinicId}`);
    });

    socket.on("join-doctor", (doctorId) => {
      socket.join(`doctor-${doctorId}`);
      console.log(`Socket ${socket.id} joined doctor-${doctorId}`);
    });

    socket.on("join-telehealth-room", async ({ roomId, name } = {}) => {
      if (!roomId) return;
      const room = `telehealth-${roomId}`;
      socket.join(room);
      const participants = await io.in(room).fetchSockets();

      socket.to(room).emit("telehealth-peer-joined", {
        socketId: socket.id,
        name: name || "Guest",
      });
      socket.emit("telehealth-room-state", {
        roomId,
        participantCount: participants.length,
      });
    });

    socket.on("telehealth-offer", ({ roomId, offer } = {}) => {
      if (roomId && offer) {
        socket.to(`telehealth-${roomId}`).emit("telehealth-offer", { offer, from: socket.id });
      }
    });

    socket.on("telehealth-answer", ({ roomId, answer } = {}) => {
      if (roomId && answer) {
        socket.to(`telehealth-${roomId}`).emit("telehealth-answer", { answer, from: socket.id });
      }
    });

    socket.on("telehealth-ice-candidate", ({ roomId, candidate } = {}) => {
      if (roomId && candidate) {
        socket.to(`telehealth-${roomId}`).emit("telehealth-ice-candidate", { candidate, from: socket.id });
      }
    });

    socket.on("leave-telehealth-room", ({ roomId } = {}) => {
      if (roomId) {
        socket.leave(`telehealth-${roomId}`);
        socket.to(`telehealth-${roomId}`).emit("telehealth-peer-left", { socketId: socket.id });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
