import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import type { Socket as IOSocket } from "socket.io";
config();

// middlewares
import errorMiddleware from "@/middlewares/error.middleware";

// routers
import userRouter from "@/routes/user.route";
import chatRouter from "@/routes/chat.route";
import msgRouter from "./routes/msg.route";
import { getOnlineUsers } from "./controllers/user.controller";

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

const app = express();
const server = createServer(app);
const io = new Server(server, { path: "/api/socket.io" });

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

app.get("/api", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/msg", msgRouter);

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

// Socket.IO

type Socket = IOSocket & { userId?: string };
// Middleware to authenticate socket connections

io.use((socket: Socket, next: (err?: Error) => void) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("invalid userID"));
  }
  socket.userId = userId;
  next();
});

let onlineUsers = [] as { socketId: string; userId: string }[];
io.on("connection", async (socket: Socket) => {
  const userId = socket.userId;
  if (!userId) return;

  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ socketId: socket.id, userId });

  const filteredUsers = await getOnlineUsers(onlineUsers);
  socket.emit("users", filteredUsers);

  socket.on("disconnect", async () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    const filteredUsers = await getOnlineUsers(onlineUsers);
    socket.emit("users", filteredUsers);
  });
});

app.use(errorMiddleware);
