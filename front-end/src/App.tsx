import { Routes, Route } from "react-router";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import ChatApp from "@/components/private/chat-app";
import Header from "./components/header";
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
      <Route path="/" element={<Header />}>
        <Route path="/" element={<ChatApp />} />
      </Route>
    </Routes>
  );
}
// todo: implement message sending and receiving
// 0. auth based on bearer token
// 1. Create a message input component
// 2. Connect the input to the message sending API
// 3. Display messages in the chat window
