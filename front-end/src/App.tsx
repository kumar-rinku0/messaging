import { Routes, Route } from "react-router";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import ChatApp from "@/components/private/chat-app";
import Header from "./components/header";
import ChatMessages from "./components/private/chat-messages";
import { useAuth } from "./hooks/use-auth";
import { DataProvider } from "./hooks/use-data";
export default function App() {
  const { isLoading, authInfo } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!authInfo) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Header />}>
          <Route path="/" element={<ChatApp />} />
          <Route path="/:chatId" element={<ChatMessages />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}
// todo: implement message sending and receiving
// 0. auth based on bearer token //done
// 1. Display messages in the chat window
