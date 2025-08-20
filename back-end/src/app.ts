import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import type { Socket as IOSocket } from "socket.io";
config();

// Extend Socket type to include 'username'
declare module "socket.io" {
  interface Socket {
    userID?: string;
  }
}
type Socket = IOSocket;

// middlewares
import errorMiddleware from "@/middlewares/error.middleware";

// routers
import userRouter from "@/routes/user.route";
import mongoose from "mongoose";

const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || `http://localhost:${port}`;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: domain } });

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed with Error:", err);
  });

// middlewares
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/api", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.use("/api/users", userRouter);

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

// Socket.IO
io.use((socket: Socket, next: (err?: Error) => void) => {
  const userID = socket.handshake.auth.userID;
  if (!userID) {
    return next(new Error("invalid userID"));
  }
  socket.userID = userID;
  next();
});

io.on("connection", (socket: Socket) => {
  console.log("user connected", {
    socketID: socket.id,
    userID: socket.userID,
  });

  let users = [] as { socketID: string; userID: string }[];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketID: id,
      userID: socket.userID as string,
    });
  }
  socket.emit("users", users);

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketID !== socket.id);
    socket.emit("users", users);
  });
});

app.use(errorMiddleware);
