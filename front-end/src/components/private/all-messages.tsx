import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import type { MessageType } from "@/types/api-types";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { Copy, ListChecks, ListTodo, Trash, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const AllMessages = ({
  chatId,
  messages,
  count,
  fetchChatMessages,
  updateMessages,
}: {
  chatId: string;
  messages: MessageType[];
  count: {
    totalMessages: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  fetchChatMessages: (pageNo: number) => void;
  updateMessages: (ids: string[]) => void;
}) => {
  const { authInfo } = useAuth();
  if (!authInfo) return;
  const [selected, setSelected] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef<boolean>(true);

  const handleCopyTEXT = async () => {
    try {
      await navigator.clipboard.writeText(
        messages
          .filter((m) => selected.includes(m._id))
          .map((m) => m.msg)
          .join(" "),
      );
      toast.success("copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleDeleteMessages = async () => {
    type ResponseType = {
      ok: boolean;
      message: string;
    };
    const { data } = await api<ResponseType>(`/msg/chatId/${chatId}`, {
      method: "DELETE",
      data: {
        ids: selected,
      },
    });
    if (!data.ok) {
      toast.error(data.message);
      return;
    }
    updateMessages(selected);
    setSelected([]);
    toast.success(data.message);
  };

  useEffect(() => {
    if (shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      shouldScrollRef.current = true;
    }
  }, [messages]);
  return (
    <>
      <ScrollArea className="flex-1 w-full overflow-y-auto">
        {messages.length > 10 && count.page < count.totalPages ? (
          <Button
            className="w-full text-center"
            variant="link"
            onClick={() => {
              shouldScrollRef.current = false;
              fetchChatMessages(count.page + 1);
            }}
          >
            load more
          </Button>
        ) : (
          <div className="p-1" />
        )}
        <div className="flex flex-col gap-2 px-2">
          {messages.map((message) => (
            <motion.div
              key={message._id}
              onDoubleClick={() =>
                setSelected((prev) =>
                  prev.includes(message._id)
                    ? prev.filter((e) => e !== message._id)
                    : [...prev, message._id],
                )
              }
              className={`max-w-[80%] relative px-4 py-2 rounded-xl text-sm shadow select-none
            ${
              message.sender === authInfo.auth_user._id
                ? "self-end bg-green-500 text-white"
                : "self-start bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
            }`}
            >
              {message.msg}
              {selected.includes(message._id) && (
                <span className="absolute -top-1 -right-1">✔️</span>
              )}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      {selected.length > 0 && (
        <div className="absolute top-1 bg-transparent flex gap-1 px-2">
          <Button onClick={handleDeleteMessages}>
            <Trash />
          </Button>
          <Button onClick={handleCopyTEXT}>
            <Copy />
          </Button>
          <Button>
            <ListChecks />
          </Button>
          <Button>
            <ListTodo />
          </Button>
          <Button variant="destructive" onClick={() => setSelected([])}>
            <X />
          </Button>
        </div>
      )}
    </>
  );
};

export default AllMessages;
