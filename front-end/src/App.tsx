import { Routes, Route } from "react-router";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import ChatApp from "@/components/private/chat-app";
import Header from "./components/header";
import ChatMessages from "./components/private/chat-messages";
import { useAuth } from "./hooks/use-auth";
import { useData } from "./hooks/use-data";
export default function App() {
  const { authInfo } = useAuth();
  const { dataState } = useData();
  if (!authInfo) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }
  if (dataState.loading) {
    return <div>Loading...</div>;
  }
  if (dataState.error) {
    return <div>{dataState.error}</div>;
  }
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <DataProvider>
          <Header />
        }
      >
        <Route path="/" element={<ChatApp />} />
        <Route path="/:chatId" element={<ChatMessages />} />
      </Route>
    </Routes>
  );
}
// todo: implement message sending and receiving
// 0. auth based on bearer token //done
// 1. Display messages in the chat window
