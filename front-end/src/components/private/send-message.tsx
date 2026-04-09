import { motion } from "motion/react";
import { easeOut } from "motion"; // Add this import at the top with other imports
import { Link, SendHorizonal } from "lucide-react";
import React from "react";
import socket from "@/services/socket";
import type { ChatType, MessageType } from "@/types/api-types";
import api from "@/services/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

const transitionDebug = {
  duration: 0.2,
  ease: easeOut,
};

type ResponseTypeOne = {
  signature: string;
  timestamp: string;
  cloudName: string;
  apiKey: string;
};

const getSignature = async (path: string) => {
  const data = await api
    .get<ResponseTypeOne>(`/user/cloud-sign?origin=chats&path=${path}`)
    .then((res) => res.data);
  return data;
};

const SendMessage = ({
  chatId,
  chat,
  setMessages,
  messages,
}: {
  chatId: string;
  chat: ChatType;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  messages: MessageType[];
}) => {
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token);
  const [msg, setMsg] = React.useState<string>("");
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Send the message to the API
    if (!auth_user || msg.trim() === "") {
      console.error("No token found in localStorage or empty message");
      return;
    }
    api
      .post(`/msg/create`, { msg: msg, chatId: chatId, sender: auth_user._id })
      .then((response) => {
        // Handle the response if needed
        const { message } = response.data;
        setMessages((prevMessages) => [...prevMessages, message]);
        setMsg(""); // Clear the input field after sending the message
        if (!chat) return;
        socket.emit("msg", chat._id, message);
      });
  };
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    socket.emit("typing", chatId, auth_user._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", chatId, auth_user._id);
    }, 1000);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="h-12 flex justify-center items-center w-full bg-accent dark:bg-accent-foreground px-1 border-t border-t-neutral-200 dark:border-t-neutral-800"
    >
      <Input
        type="text"
        onChange={handleTyping}
        value={msg}
        className="relative h-9 w-[250px] flex-grow rounded-lg border border-gray-200 bg-white px-3 text-[15px] outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1
            dark:border-black/60 dark:bg-black dark:text-gray-50 dark:placeholder-gray-500 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700"
        placeholder="Type your message"
      />
      <motion.div
        key={messages.length}
        layout="position"
        className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 [word-break:break-word] dark:bg-black"
        layoutId={`container-[${messages.length}]`}
        initial={{ opacity: 0.6, zIndex: -1 }}
        animate={{ opacity: 0.6, zIndex: -1 }}
        exit={{ opacity: 1, zIndex: 1 }}
        transition={transitionDebug}
      >
        <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-50">
          {msg || "Type your message"}
        </div>
      </motion.div>

      <SendMessageWithAttachment chatId={chatId} setMessages={setMessages} />

      <Button
        type="submit"
        className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200
            dark:bg-black cursor-pointer"
      >
        <SendHorizonal className="h-5 w-5 text-gray-600 dark:text-gray-50" />
      </Button>
    </form>
  );
};

const SendMessageWithAttachment = ({
  chatId,
  setMessages,
}: {
  chatId: string;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}) => {
  const { authInfo } = useAuth();
  if (!authInfo) return;

  const [files, setFiles] = React.useState<File[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files ? Array.from(e.target.files) : null);
  };
  const handleUploadFiles = async () => {
    if (!files || files.length < 1) return;
    setLoading(true);
    for (const file of files) {
      const { signature, timestamp, cloudName, apiKey } =
        await getSignature(chatId);
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", apiKey); // safe, can be public
      data.append("timestamp", timestamp);
      data.append("signature", signature);
      data.append("folder", `chats/${chatId}`);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: data },
      );
      const result = await response.json();
      console.log("cloudinary res result", result);
      const { data: mData } = await api.post<{
        message: MessageType;
        ok: boolean;
      }>(`/msg/create`, {
        chatId: chatId,
        sender: authInfo.auth_user._id,
        msg: result.original_filename as string,
        attachment: {
          url: result.secure_url as string,
          type: file.type ?? "application/octet-stream",
        },
      });
      console.log(mData);
      if (!mData.ok) {
        console.log(mData.message);
        return;
      }
      socket.emit("msg", chatId, mData.message);
      setMessages((prev) => [...prev, mData.message]);
    }
    setLoading(false);
    setFiles(null);
  };
  return (
    <>
      <Input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />

      <Label
        htmlFor="file-upload"
        className="ml-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-200
          dark:bg-black"
      >
        <Link className="h-4 w-4 text-gray-600 dark:text-gray-50" />
      </Label>

      <Dialog open={!!files} onOpenChange={() => setFiles(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>

            {files && files.map((file) => <span>{file.name}</span>)}

            <DialogDescription>
              This will save file data to our servers. You can remove that
              later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFiles(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadFiles} disabled={loading}>
              Yes, I'm sure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendMessage;
