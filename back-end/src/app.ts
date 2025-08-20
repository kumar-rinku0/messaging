import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
config();

// middlewares
import errorMiddleware from "@/middlewares/error.middleware";

const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: domain } });

// middlewares
app.use(cors());

app.get("/api", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

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
