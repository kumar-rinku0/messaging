import { useData } from "@/hooks/use-data";
import { useParams } from "react-router";
import ChatHeader from "./chat-header";

const ChatMembers = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { chats } = useData();
  if (!chatId || !chats) {
    return <div>Invalid Chat Id</div>;
  }
  const chat = chats.find((c) => c._id === chatId);
  if (!chat) {
    return <div>Chat not found</div>;
  }
  if (chat.type === "private") {
    return <div>Private chat members are not visible</div>;
  }
  return (
    <div className="min-h-screen">
      {/* <ChatHeader chatId={chatId} chat={chat} /> */}
      <div className="flex justify-center items-center h-[80vh]">
        <div className="p-4 max-w-sm bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Chat Name */}
          <div className="text-xl font-semibold text-gray-800 mb-3">
            {chat?.displayName}
          </div>

          {/* Section Title */}
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Chat Members
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {chat.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="relative w-10 h-10 border-2 border-gray-300 rounded-full overflow-hidden">
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="object-cover"
                  />
                </div>
                <span className="text-gray-700">{member.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMembers;
