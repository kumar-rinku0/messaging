import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
config();

// middlewares
import errorMiddleware from "@/middlewares/error.middleware";

// routers
import userRouter from "@/routes/user.route";
import chatRouter from "@/routes/chat.route";
import msgRouter from "@/routes/msg.route";
import { getOnlineUsers } from "@/controllers/user.controller";

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";
const DOMAIN_URL = process.env.DOMAIN_URL || "http://localhost:5173";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: DOMAIN_URL, methods: ["GET", "POST"] },
  path: "/api/socket.io",
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed with Error:", err);
  });

// middlewares
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/", (req, res) => {
  return res.json({ req: "success" });
});

app.get("/api", (req, res) => {
  return res.json({ req: "success" });
});

app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/msg", msgRouter);

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

// Socket.IO

let onlineUsers = [] as { socketId: string; userId: string }[];
io.on("connection", async (socket: Socket) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) return;
  console.log("a user connected with ID:", userId);
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ socketId: socket.id, userId });

  const filteredUsers = await getOnlineUsers(onlineUsers);
  socket.emit("online-users", filteredUsers);
  socket.broadcast.emit("online-users", filteredUsers);

  socket.on("msg", (recipients: string[], msg) => {
    console.log("recipients:", recipients);
    console.log("message received:", msg);
    recipients.map((recipientId) => {
      const recipientSocket = onlineUsers.find(
        (user) => user.userId === recipientId
      );
      if (recipientSocket) {
        socket.to(recipientSocket.socketId).emit("msg", msg);
      }
    });
  });

  socket.on("disconnect", async () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    const filteredUsers = await getOnlineUsers(onlineUsers);
    socket.emit("online-users", filteredUsers);
    socket.broadcast.emit("online-users", filteredUsers);
  });
});

app.use(errorMiddleware);
