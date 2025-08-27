import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const socket = io(socketUrl, {
  path: "/api/socket.io",
  autoConnect: false,
});

export default socket;
