"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
(0, dotenv_1.config)();
// middlewares
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
// routers
const user_route_1 = __importDefault(require("./routes/user.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const msg_route_1 = __importDefault(require("./routes/msg.route"));
const user_controller_1 = require("./controllers/user.controller");
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myapp";
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { path: "/api/socket.io" });
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("MongoDB connected");
})
    .catch((err) => {
    console.error("MongoDB connection failed with Error:", err);
});
// middlewares
app.use(express_1.default.json({ limit: "40kb" }));
app.use(express_1.default.urlencoded({ limit: "40kb", extended: true }));
app.get("/api", (req, res) => {
    res.send("<h1>Hello world</h1>");
});
app.use("/api/users", user_route_1.default);
app.use("/api/chat", chat_route_1.default);
app.use("/api/msg", msg_route_1.default);
server.listen(port, () => {
    console.log(`listening on ${port}`);
});
// Socket.IO
let onlineUsers = [];
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = socket.handshake.auth.userId;
    if (!userId)
        return;
    console.log("a user connected with ID:", userId);
    !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ socketId: socket.id, userId });
    const filteredUsers = yield (0, user_controller_1.getOnlineUsers)(onlineUsers);
    socket.emit("online-users", filteredUsers);
    socket.broadcast.emit("online-users", filteredUsers);
    socket.on("msg", (recipients, msg) => {
        console.log("message received:", msg);
        recipients.map((recipientId) => {
            const recipientSocket = onlineUsers.find((user) => user.userId === recipientId);
            if (recipientSocket) {
                socket.to(recipientSocket.socketId).emit("msg", msg);
            }
        });
    });
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        const filteredUsers = yield (0, user_controller_1.getOnlineUsers)(onlineUsers);
        socket.emit("online-users", filteredUsers);
        socket.broadcast.emit("online-users", filteredUsers);
    }));
}));
app.use(error_middleware_1.default);
