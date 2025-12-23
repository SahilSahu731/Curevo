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
