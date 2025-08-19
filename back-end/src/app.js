import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
config();

const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || `http://localhost:${port}`;

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: domain });

app.get("/api", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

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

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
