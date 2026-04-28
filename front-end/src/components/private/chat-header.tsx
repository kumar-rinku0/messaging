import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useData } from "@/hooks/use-data";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import api from "@/services/api";
import type { ChatType } from "@/types/api-types";

const ChatHeader = ({
  chatId,
  chat,
  updateMessages,
}: {
  chatId: string;
  chat: ChatType;
  updateMessages: (ids: []) => void;
}) => {
  const typingUsers = chat.members;
  return (
    <div className="h-14 px-2 flex justify-between items-center border-b border-b-gray-200">
      <div className="flex justify-center items-center gap-4 px-4">
        <div className="relative w-12 h-12">
          <img
            src={
              chat?.displayAvatar ||
              "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
            }
            alt=""
            className="object-cover w-12 h-12 rounded-full"
          />
        </div>
        <span className="font-semibold">{chat?.displayName}</span>
        {typingUsers && typingUsers.some((user) => user?.typing) && (
          <span className="font-light text-sm truncate">
            {typingUsers
              .filter((user) => user?.typing)
              .map((user) => `${user.username} `)}
            typing
          </span>
        )}
      </div>
      <MoreOptions chatId={chatId!} updateMessages={updateMessages} />
    </div>
  );
};

type ResponseTypeDeleteChat = {
  message: string;
  ok: boolean;
};

type ResponseTypeDeleteMsg = {
  message: string;
  ok: boolean;
};

const MoreOptions = ({
  chatId,
  updateMessages,
}: {
  chatId: string;
  updateMessages: (ids: []) => void;
}) => {
  const router = useNavigate();
  const { removeOneChat } = useData();
  const handleDeleteChat = () => {
    api.delete<ResponseTypeDeleteChat>(`/chat/chatId/${chatId}`).then((res) => {
      if (!res.data.ok) {
        toast.error(res.data.message);
        return;
      }
      removeOneChat(chatId);
      router("/");
      toast.success(res.data.message);
    });
  };
  const handleClearMessages = () => {
    api
      .delete<ResponseTypeDeleteMsg>(`/msg/all/chatId/${chatId}`)
      .then((res) => {
        if (!res.data.ok) {
          toast.error(res.data.message);
          return;
        }
        updateMessages([]);
        toast.success(res.data.message);
      });
  };
  return (
    <Popover>
      <PopoverTrigger>
        <MoreVertical />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <PopoverHeader>
          <Button
            variant="link"
            className="justify-start cursor-pointer"
            onClick={handleClearMessages}
          >
            Clear Messages
          </Button>
          <Button
            variant="link"
            onClick={handleDeleteChat}
            className="justify-start cursor-pointer"
          >
            Delete Chat
          </Button>
          <Button
            variant="link"
            onClick={() => router(`/${chatId}/members`)}
            className="justify-start cursor-pointer"
          >
            View Members
          </Button>
          <Button
            variant="link"
            onClick={() => {}}
            className="justify-start cursor-pointer"
          >
            Rename Chat
          </Button>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
};

export default ChatHeader;
