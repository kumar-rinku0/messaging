import { Routes, Route } from "react-router";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import ChatApp from "./components/private/chat-app";
export default function App() {
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<ChatApp />} />
    </Routes>
  );
}
