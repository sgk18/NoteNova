import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected", socket.id);

      socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });

      socket.on("send-message", (data) => {
        // data: { room, message, sender, timestamp }
        io.to(data.room).emit("receive-message", data);
      });

      socket.on("escalation-request", (data) => {
        // Broadcast escalation to departmental room
        // data: { department, user, question, id }
        socket.to(data.department).emit("new-escalation", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  res.end();
}
