import { Routes, Route } from "react-router";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
