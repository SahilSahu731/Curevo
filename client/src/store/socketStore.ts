import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  reconnecting: boolean;
  error: string | null;

  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  reconnecting: false,
  error: null,

  connect: () => {
    if (get().socket) return;

    if (!useAuthStore.getState().user) return;

    const configured = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const parsed = new URL(configured, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (parsed.pathname.endsWith("/api")) parsed.pathname = parsed.pathname.slice(0, -4) || "/";
    const socket = io(parsed.origin + (parsed.pathname === "/" ? "" : parsed.pathname), {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5_000,
      timeout: 10_000,
    });

    socket.on("connect", () => {
      set({ connected: true, reconnecting: false, error: null });
    });

    socket.on("disconnect", () => {
      set({ connected: false, reconnecting: false });
    });
    socket.io.on("reconnect_attempt", () => set({ reconnecting: true }));
    socket.on("connect_error", (error) => set({ connected: false, reconnecting: false, error: error.message }));

    set({ socket });
    socket.connect();
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, connected: false, reconnecting: false, error: null });
  },
}));
