import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import type { MessageType } from "@/types/api-types";
import { motion } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { ListChecks, ListTodo, Trash } from "lucide-react";

const AllMessages = ({
  messages,
  count,
  fetchChatMessages,
}: {
  messages: MessageType[];
  count: {
    totalMessages: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  fetchChatMessages: (pageNo: number) => void;
}) => {
  const { authInfo } = useAuth();
  if (!authInfo) return;
  const [selected, setSelected] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef<boolean>(true);

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
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm shadow
            ${
              message.sender === authInfo.auth_user._id
                ? "self-end bg-green-500 text-white"
                : "self-start bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
            }`}
            >
              {message.msg}
              {selected.includes(message._id) && (
                <span className="text-red-500">*</span>
              )}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      {selected.length > 0 && (
        <div className="absolute top-1 right-0 bg-transparent flex gap-1">
          <Button>
            <Trash />
          </Button>
          <Button>
            <ListChecks />
          </Button>
          <Button>
            <ListTodo />
          </Button>
        </div>
      )}
    </>
  );
};

export default AllMessages;
