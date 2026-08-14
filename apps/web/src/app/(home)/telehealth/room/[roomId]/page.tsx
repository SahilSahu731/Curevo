"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";

type DeviceOption = { deviceId: string; label: string };
type GrantResponse = { roomId: string; appointmentId: string; accessGrant: string };
type Participant = { name: string; role: string };

const policyVersion = "2026-08-03";
const configuredTurnUrls = (process.env.NEXT_PUBLIC_TURN_URLS || process.env.NEXT_PUBLIC_TURN_URL || "")
  .split(",").map((url) => url.trim()).filter(Boolean);
const iceServers: RTCIceServer[] = [
  { urls: process.env.NEXT_PUBLIC_STUN_URL || "stun:stun.l.google.com:19302" },
  ...(configuredTurnUrls.length ? [{
    urls: configuredTurnUrls,
    username: process.env.NEXT_PUBLIC_TURN_USERNAME,
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
  }] : []),
];

export default function TelehealthRoomPage() {
  const { roomId: requestedRoomId } = useParams<{ roomId: string }>();
  const roomId = requestedRoomId;
  const router = useRouter();
  const { user } = useAuthStore();
  const { socket, connect } = useSocketStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const grantRef = useRef<GrantResponse | null>(null);
  const joinedRef = useRef(false);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  const polite = user?.role !== "doctor";
  const [status, setStatus] = useState("Waiting to join");
  const [error, setError] = useState("");
  const [limitationsAcknowledged, setLimitationsAcknowledged] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [clinicianPresent, setClinicianPresent] = useState(false);
  const [audioDevices, setAudioDevices] = useState<DeviceOption[]>([]);
  const [videoDevices, setVideoDevices] = useState<DeviceOption[]>([]);
  const [audioDevice, setAudioDevice] = useState("");
  const [videoDevice, setVideoDevice] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [bandwidth, setBandwidth] = useState<string>("Checking connection");
  const [microphoneStatus, setMicrophoneStatus] = useState("Not tested");

  useEffect(() => {
    if (!user) router.replace(`/login?from=${encodeURIComponent(`/telehealth/room/${roomId}`)}`);
    else connect();
  }, [connect, roomId, router, user]);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { downlink?: number } }).connection;
    setBandwidth(connection?.downlink ? `${connection.downlink} Mbps estimated` : "Network quality will appear during the call");
  }, []);

  useEffect(() => {
    if (!startedAt) return;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const enumerate = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audio = devices.filter((device) => device.kind === "audioinput").map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Microphone ${index + 1}` }));
      const video = devices.filter((device) => device.kind === "videoinput").map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Camera ${index + 1}` }));
      setAudioDevices(audio); setVideoDevices(video);
      if (!audioDevice) setAudioDevice(audio[0]?.deviceId || "");
      if (!videoDevice) setVideoDevice(video[0]?.deviceId || "");
    } catch { setError("Device discovery is unavailable. Check your browser permissions."); }
  }, [audioDevice, videoDevice]);

  useEffect(() => { if (consentAccepted) enumerate(); }, [consentAccepted, enumerate]);

  useEffect(() => {
    if (mediaReady && localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;
  }, [mediaReady]);

  useEffect(() => () => {
    if (grantRef.current && joinedRef.current) socket?.emit("leave-telehealth-room", { roomId: grantRef.current.roomId });
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
  }, [socket]);

  const createPeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;
    const peer = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 2 });
    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current!));
    peer.onicecandidate = ({ candidate }) => {
      if (candidate && grantRef.current) socket?.emit("telehealth-ice-candidate", { roomId: grantRef.current.roomId, candidate });
    };
    peer.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) remoteVideoRef.current.srcObject = streams[0];
      setStatus("Connected");
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") { setStatus("Connected"); setStartedAt((value) => value || Date.now()); }
      if (peer.connectionState === "connecting") setStatus("Connecting");
      if (peer.connectionState === "disconnected") setStatus("Reconnecting");
      if (peer.connectionState === "failed") { setStatus("Connection failed; retrying"); try { peer.restartIce(); } catch { /* browser does not support ICE restart */ } }
    };
    peer.onnegotiationneeded = async () => {
      if (!grantRef.current || makingOffer.current) return;
      try {
        makingOffer.current = true;
        await peer.setLocalDescription();
        socket?.emit("telehealth-offer", { roomId: grantRef.current.roomId, offer: peer.localDescription });
      } catch { setStatus("Unable to negotiate media"); } finally { makingOffer.current = false; }
    };
    peerRef.current = peer;
    return peer;
  }, [socket]);

  const startMedia = useCallback(async () => {
    setError(""); setStatus("Requesting camera and microphone");
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioDevice ? { deviceId: { exact: audioDevice } } : true,
          video: videoDevice ? { deviceId: { exact: videoDevice } } : true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: audioDevice ? { deviceId: { exact: audioDevice } } : true, video: false });
        setAudioOnly(true); setCameraEnabled(false);
      }
      localStreamRef.current = stream;
      setMicrophoneStatus(stream.getAudioTracks().length ? "Microphone ready" : "Microphone unavailable");
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setMediaReady(true); setStatus(user?.role === "patient" && !clinicianPresent ? "Waiting for clinician" : "Waiting for participant");
      createPeer();
      await enumerate();
    } catch { setError("Microphone access is required. You can retry or check browser permissions."); setStatus("Media permission needed"); }
  }, [audioDevice, videoDevice, user?.role, clinicianPresent, createPeer, enumerate]);

  useEffect(() => {
    if (!socket || !mediaReady || !grantRef.current || joinedRef.current) return;
    const grant = grantRef.current;
    socket.emit("join-telehealth-room", { roomId: grant.roomId, grant: grant.accessGrant });
    joinedRef.current = true;
    const state = ({ participants: next, clinicianPresent: present }: { participants: Participant[]; clinicianPresent: boolean }) => { setParticipants(next); setClinicianPresent(present); if (!present && user?.role === "patient") setStatus("Waiting for clinician"); };
    const peerJoined = async () => {
      setStatus("Connecting");
      const peer = createPeer();
      if (peer.signalingState !== "stable" || makingOffer.current) return;
      try {
        makingOffer.current = true;
        await peer.setLocalDescription();
        socket.emit("telehealth-offer", { roomId: grant.roomId, offer: peer.localDescription });
      } catch { setStatus("Negotiation failed"); } finally { makingOffer.current = false; }
    };
    const offer = async ({ offer: description }: { offer: RTCSessionDescriptionInit }) => {
      const peer = createPeer();
      const collision = makingOffer.current || peer.signalingState !== "stable";
      ignoreOffer.current = !polite && collision;
      if (ignoreOffer.current) return;
      try { await peer.setRemoteDescription(description); await peer.setLocalDescription(); socket.emit("telehealth-answer", { roomId: grant.roomId, answer: peer.localDescription }); } catch { setStatus("Negotiation failed"); }
    };
    const answer = async ({ answer: description }: { answer: RTCSessionDescriptionInit }) => { try { await createPeer().setRemoteDescription(description); } catch { setStatus("Negotiation failed"); } };
    const candidate = async ({ candidate: value }: { candidate: RTCIceCandidateInit }) => { if (!ignoreOffer.current) { try { await createPeer().addIceCandidate(value); } catch { /* stale candidate */ } } };
    const left = () => { setStatus("Participant left"); setStartedAt(null); if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; };
    const started = () => { setStartedAt((value) => value || Date.now()); setStatus("Connecting"); };
    const roomError = ({ message }: { message: string }) => { setError(message); setStatus("Room access denied"); };
    socket.on("telehealth-room-state", state); socket.on("telehealth-peer-joined", peerJoined); socket.on("telehealth-offer", offer); socket.on("telehealth-answer", answer); socket.on("telehealth-ice-candidate", candidate); socket.on("telehealth-peer-left", left); socket.on("telehealth-call-started", started); socket.on("room-error", roomError);
    return () => { socket.off("telehealth-room-state", state); socket.off("telehealth-peer-joined", peerJoined); socket.off("telehealth-offer", offer); socket.off("telehealth-answer", answer); socket.off("telehealth-ice-candidate", candidate); socket.off("telehealth-peer-left", left); socket.off("telehealth-call-started", started); socket.off("room-error", roomError); };
  }, [socket, mediaReady, createPeer, polite, user?.role]);

  useEffect(() => {
    const recover = () => { setStatus("Reconnecting"); if (peerRef.current?.connectionState === "failed") peerRef.current.restartIce(); };
    const offline = () => setStatus("Network offline");
    window.addEventListener("online", recover); window.addEventListener("offline", offline);
    return () => { window.removeEventListener("online", recover); window.removeEventListener("offline", offline); };
  }, []);

  const acceptAndJoin = async () => {
    setConsentSaving(true); setError("");
    try {
      await apiClient.post("/auth/consents", { type: "telehealth", accepted: true, policyVersion });
      const response = await apiClient.get<{ data: GrantResponse }>(`/appointments/telehealth/rooms/${encodeURIComponent(roomId)}/access`);
      grantRef.current = response.data.data;
      setConsentAccepted(true);
    } catch (requestError: unknown) {
      const response = requestError as { response?: { data?: { error?: string } } };
      setError(response.response?.data?.error || "This appointment is not available yet.");
    }
    finally { setConsentSaving(false); }
  };

  const endCall = () => {
    if (!window.confirm("End this telehealth visit?")) return;
    if (grantRef.current && joinedRef.current) socket?.emit("leave-telehealth-room", { roomId: grantRef.current.roomId });
    joinedRef.current = false; localStreamRef.current?.getTracks().forEach((track) => track.stop()); peerRef.current?.close();
    const destination = user?.role === "doctor" ? "/doctor-dashboard" : user?.role === "admin" ? "/admin-dashboard" : "/dashboard";
    router.push(destination);
  };
  const toggleAudio = () => { const next = !micEnabled; localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; }); setMicEnabled(next); };
  const toggleVideo = () => { const next = !cameraEnabled; localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; }); setCameraEnabled(next); };
  const formatDuration = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (!consentAccepted) return <div className="min-h-screen bg-zinc-950 px-4 py-16 text-white"><div className="mx-auto max-w-xl space-y-6 border border-white/10 bg-zinc-900 p-6"><h1 className="text-2xl font-bold">Before joining the video visit</h1><p className="text-sm leading-6 text-zinc-300">Live audio and video are available only to the participants assigned to this appointment. Recording, chat, screen sharing, captions, and attachments are not available.</p><div className="border-l-4 border-amber-400 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">For severe or rapidly worsening symptoms, contact local emergency services. Do not wait in this room.</div><label className="flex items-start gap-3 text-sm text-zinc-200"><Checkbox checked={limitationsAcknowledged} onCheckedChange={(value) => setLimitationsAcknowledged(value === true)} /><span>I understand these limitations and consent to use camera and microphone for this scheduled visit.</span></label>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<Button onClick={acceptAndJoin} disabled={!limitationsAcknowledged || consentSaving} className="w-full">{consentSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing secure room</> : "Continue to device check"}</Button></div></div>;

  return <div className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4"><header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Telehealth Consultation</h1><p className="text-sm text-zinc-400">{participants.length ? participants.map((participant) => `${participant.name} (${participant.role})`).join(" and ") : "Secure appointment room"}</p></div><div className="flex items-center gap-2"><Badge className="bg-emerald-500/20 text-emerald-200">{status}</Badge>{startedAt && <span className="text-sm text-zinc-400">{formatDuration}</span>}</div></header>{!mediaReady ? <section className="mx-auto w-full max-w-xl space-y-5 rounded-xl border border-white/10 bg-zinc-900 p-6"><h2 className="text-lg font-semibold">Device check</h2><p className="text-sm text-zinc-400">Choose devices, preview your camera, and test your microphone before entering the waiting room.</p><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Microphone<select value={audioDevice} onChange={(event) => setAudioDevice(event.target.value)} className="mt-1 w-full rounded border border-white/10 bg-zinc-800 p-2">{audioDevices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}</select></label><label className="text-sm">Camera<select value={videoDevice} onChange={(event) => setVideoDevice(event.target.value)} className="mt-1 w-full rounded border border-white/10 bg-zinc-800 p-2">{videoDevices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.label}</option>)}</select></label></div><p className="text-xs text-emerald-300">{microphoneStatus}</p><p className="text-xs text-zinc-500">{bandwidth}</p>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<Button onClick={startMedia} className="w-full">Start device preview</Button></section> : <main className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]"><section className="relative overflow-hidden rounded-xl bg-black"><video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[420px] w-full object-cover" />{user?.role === "patient" && !clinicianPresent && <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center"><p className="max-w-sm text-zinc-200">Your clinician has not joined yet. Keep this page open; you will enter the call when they arrive.</p></div>}<div className="pointer-events-none absolute bottom-4 left-4 rounded bg-black/60 px-3 py-2 text-sm text-zinc-200">{audioOnly ? "Audio only" : "Camera on"}</div></section><aside className="flex flex-col gap-4"><div className="overflow-hidden rounded-xl bg-zinc-900"><video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" /></div><div className="rounded-xl border border-white/10 bg-zinc-900 p-4"><h2 className="font-semibold">Call controls</h2><div className="mt-4 grid grid-cols-3 gap-3"><Button aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"} title={micEnabled ? "Mute microphone" : "Unmute microphone"} variant="secondary" size="icon" onClick={toggleAudio}>{micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</Button><Button aria-label={cameraEnabled ? "Turn camera off" : "Turn camera on"} title={cameraEnabled ? "Turn camera off" : "Turn camera on"} variant="secondary" size="icon" onClick={toggleVideo} disabled={audioOnly}>{cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</Button><Button aria-label="End telehealth visit" title="End telehealth visit" variant="destructive" size="icon" onClick={endCall}><PhoneOff className="h-4 w-4" /></Button></div><p className="mt-4 text-xs text-zinc-500">Recording, chat, screen sharing, captions, and attachments are unavailable.</p></div>{error && <p role="alert" className="rounded border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}</aside></main>}</div></div>;
}
