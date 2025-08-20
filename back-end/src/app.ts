import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
config();

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
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("create-something", (msg) => {
    console.log("create-something received:", msg);
    io.emit("foo", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(errorMiddleware);
