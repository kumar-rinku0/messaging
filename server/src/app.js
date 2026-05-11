import express from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
config();

// middlewares
import errorMiddleware from "./middlewares/error.middleware.js";
import { isLoggedInCheck, onlyLoggedInUser } from "./middlewares/auth.js";

// routers
import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import msgRouter from "./routes/msg.route.js";
import {
  getMembersFromChat,
  getOneOnlineUserUsername,
  updateNotificationCount,
} from "./utils/type-fix.js";
import { createNotifications } from "./utils/expo-notification.js";

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";
const DOMAIN_URL = process.env.DOMAIN_URL || "http://localhost:5173";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: DOMAIN_URL, methods: ["GET", "POST"] },
  path: "/api/socket.io",
  connectionStateRecovery: {},
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

let onlineUsers = [];

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth.userId;
  const username = await getOneOnlineUserUsername(userId);
  if (!userId || !username) return;
  console.log("a user connected:", username);

  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ socketId: socket.id, userId, username });

  socket.emit("online-users", onlineUsers);
  socket.broadcast.emit("online-users", onlineUsers);

  socket.on("join-chat", async (chatId) => {
    socket.join(chatId);
    await updateNotificationCount({ pos: "reset", chatId, userId });
    console.log(`User ${username} joined chat ${chatId}`);
  });

  socket.on("msg", async (chatId, msg) => {
    socket.to(chatId).emit("msg", msg);
    await updateNotificationCount({ pos: "inc", chatId, userId });
    const membersExceptSender = await getMembersFromChat(chatId, userId);
    for (const member of membersExceptSender) {
      const isMemberOnline = onlineUsers.some(
        (onlineUser) => onlineUser.userId === member.toString(),
      );
      if (isMemberOnline) {
        socket.except(chatId).emit("notification", msg);
      }
    }
    await createNotifications(membersExceptSender, msg, username);
  });

  // user typing status
  socket.on("typing", async (chatId, thisUser) => {
    const membersExceptSender = await getMembersFromChat(chatId, thisUser);
    for (const onlineUser of onlineUsers) {
      const isMemberOnline = membersExceptSender.some(
        (member) => member.toString() === onlineUser.userId,
      );
      if (isMemberOnline) {
        socket
          .to(onlineUser.socketId)
          .emit("user_typing", { chatId: chatId, userId: thisUser });
      }
    }
  });

  socket.on("stop_typing", async (chatId, thisUser) => {
    const membersExceptSender = await getMembersFromChat(chatId, thisUser);
    for (const onlineUser of onlineUsers) {
      const isMemberOnline = membersExceptSender.some(
        (member) => member.toString() === onlineUser.userId,
      );
      if (isMemberOnline) {
        socket
          .to(onlineUser.socketId)
          .emit("user_stop_typing", { chatId: chatId, userId: thisUser });
      }
    }
  });

  socket.on("leave-chat", async (chatId) => {
    socket.leave(chatId);
    await updateNotificationCount({ pos: "reset", chatId, userId });
    console.log(`User ${username} left chat ${chatId}`);
  });

  socket.on("disconnect", async () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    socket.emit("online-users", onlineUsers);
    socket.broadcast.emit("online-users", onlineUsers);
  });
});

app.use(errorMiddleware);
