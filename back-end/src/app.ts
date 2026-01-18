import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
config();

// middlewares
import errorMiddleware from "@/middlewares/error.middleware";
import { isLoggedInCheck, onlyLoggedInUser } from "./middlewares/auth";

// routers
import userRouter from "@/routes/user.route";
import chatRouter from "@/routes/chat.route";
import msgRouter from "@/routes/msg.route";
import {
  getChat,
  getMembersFromChat,
  getOnlineUsers,
  updateNotificationCount,
} from "./utils/type-fix";
import { createNotifications } from "./utils/expo-notification";

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
app.set("trust proxy", true);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(isLoggedInCheck);

app.get("/", (req, res) => {
  return res.json({ req: "success", ok: true });
});

app.get("/api", (req, res) => {
  return res.json({ req: "success", ok: true });
});

app.use("/api/user", userRouter);
app.use("/api/chat", onlyLoggedInUser, chatRouter);
app.use("/api/msg", onlyLoggedInUser, msgRouter);

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

  socket.on("join-chat", async (chatId) => {
    socket.join(chatId);
    await updateNotificationCount({ pos: "reset", chatId, userId });
    console.log(`User ${userId} joined chat ${chatId}`);
  });

  socket.on(
    "msg",
    async (
      { chatId, userId }: { chatId: string; userId: string },
      msg: any,
    ) => {
      socket.join(chatId);
      socket.to(chatId).emit("msg", msg);
      await updateNotificationCount({ pos: "inc", chatId, userId });
      const membersExceptSender = await getMembersFromChat(chatId, userId);
      membersExceptSender.map((member) => {
        const isMemberOnline = onlineUsers.some(
          (onlineUser) => onlineUser.userId === member.toString(),
        );
        if (isMemberOnline) {
          socket.except(chatId).emit("notification", msg);
        }
      });
      const sender = filteredUsers.find((v) => v._id.toString() === userId);
      const username = sender?.username || "new message";
      await createNotifications(membersExceptSender, msg, username);
    },
  );

  // user typing status
  socket.on("typing", (thisUser) => {
    const user = onlineUsers.find((u) => u.userId === thisUser);
    if (user) {
      socket.to(user.socketId).emit("user_typing", thisUser);
    }
  });

  socket.on("stop_typing", (thisUser) => {
    const user = onlineUsers.find((u) => u.userId === thisUser);
    if (user) {
      socket.to(user.socketId).emit("user_stop_typing", thisUser);
    }
  });

  socket.on("leave-chat", async (chatId) => {
    socket.leave(chatId);
    await updateNotificationCount({ pos: "reset", chatId, userId });
    console.log(`User ${userId} left chat ${chatId}`);
  });

  socket.on("disconnect", async () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    const filteredUsers = await getOnlineUsers(onlineUsers);
    socket.emit("online-users", filteredUsers);
    socket.broadcast.emit("online-users", filteredUsers);
  });
});

app.use(errorMiddleware);
