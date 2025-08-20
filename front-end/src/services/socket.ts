import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const domain = import.meta.env.VITE_BACKEND_URL;
const URL = domain || "http://localhost:4000";

export const socket = io(URL, { autoConnect: false });
