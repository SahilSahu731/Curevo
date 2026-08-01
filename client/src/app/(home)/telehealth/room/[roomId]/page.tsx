"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function TelehealthRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user } = useAuthStore();
  const { socket, connect } = useSocketStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("Preparing secure room");
  const [mediaReady, setMediaReady] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const createPeer = () => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(rtcConfig);
    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current!));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("telehealth-ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setStatus("Connected");
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") setStatus("Connected");
      if (["disconnected", "failed", "closed"].includes(peer.connectionState)) setStatus("Waiting for participant");
    };

    peerRef.current = peer;
    return peer;
  };

  const makeOffer = async () => {
    const peer = createPeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket?.emit("telehealth-offer", { roomId, offer });
  };

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    let mounted = true;

    const prepareMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setMediaReady(true);
        setStatus("Waiting for participant");
      } catch (error) {
        setStatus("Camera or microphone permission is required");
      }
    };

    prepareMedia();
    return () => {
      mounted = false;
      setMediaReady(false);
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.close();
      socket?.emit("leave-telehealth-room", { roomId });
    };
  }, [roomId, socket]);

  useEffect(() => {
    if (!socket || !roomId || !mediaReady || !localStreamRef.current) return;

    socket.emit("join-telehealth-room", { roomId, name: user?.name });

    const handlePeerJoined = () => {
      setStatus("Connecting");
      makeOffer();
    };

    const handleOffer = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      const peer = createPeer();
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("telehealth-answer", { roomId, answer });
    };

    const handleAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      const peer = createPeer();
      if (!peer.currentRemoteDescription) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      const peer = createPeer();
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handlePeerLeft = () => {
      setStatus("Participant left");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    socket.on("telehealth-peer-joined", handlePeerJoined);
    socket.on("telehealth-offer", handleOffer);
    socket.on("telehealth-answer", handleAnswer);
    socket.on("telehealth-ice-candidate", handleIce);
    socket.on("telehealth-peer-left", handlePeerLeft);

    return () => {
      socket.off("telehealth-peer-joined", handlePeerJoined);
      socket.off("telehealth-offer", handleOffer);
      socket.off("telehealth-answer", handleAnswer);
      socket.off("telehealth-ice-candidate", handleIce);
      socket.off("telehealth-peer-left", handlePeerLeft);
    };
  }, [socket, roomId, user?.name, mediaReady]);

  const toggleAudio = () => {
    const next = !micEnabled;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicEnabled(next);
  };

  const toggleVideo = () => {
    const next = !cameraEnabled;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraEnabled(next);
  };

  const endCall = () => {
    socket?.emit("leave-telehealth-room", { roomId });
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Telehealth Consultation</h1>
            <p className="text-sm text-zinc-400">Room {roomId}</p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20">{status}</Badge>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
          <section className="relative overflow-hidden rounded-xl bg-black">
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[420px] w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 pointer-events-none">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">{status}</div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl bg-zinc-900">
              <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <h2 className="font-semibold">Call Controls</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Button variant="secondary" size="icon" onClick={toggleAudio}>
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" size="icon" onClick={toggleVideo}>
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="icon" onClick={endCall}>
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
