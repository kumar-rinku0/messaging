import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import api from "@/services/api";
import { useEffect, useState } from "react";
import type { MessageType } from "@/types/api-types";
import { toast } from "sonner";
import socket from "@/services/socket";

type ResponseType = {
  users: {
    _id: string;
    username: string;
  }[];
  message: string;
};

const ChatApp = () => {
  const token = localStorage.getItem("token");
  useEffect(() => {
    function onChatMessage(newMsg: MessageType) {
      toast.message(`new message`, {
        description: newMsg.msg,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            // navigate to chat
            location.assign(`/${newMsg.chat}`);
          },
        },
      });
    }
    socket.on("msg", onChatMessage);
    return () => {
      socket.off("msg", onChatMessage);
    };
  }, []);

  if (!token) {
    return <div>Please log in to access the chat application.</div>;
  }
  const [searchContent, setSearchContent] = useState<ResponseType["users"]>([]);
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement search functionality here
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get("search");
    console.log("Searching for:", searchTerm);
    api.get(`/users/search?q=${searchTerm}`).then((response) => {
      console.log("Search results:", response.data);
      setSearchContent(response.data.users);
    });
  };

  return (
    <>
      {/* mobile device view
      <div className="flex md:hidden">
        <SideNav mobile />
      </div> */}
      <div className="flex">
        <div>
          <form
            className="flex items-center justify-center"
            onSubmit={handleSearch}
          >
            <Input
              placeholder="Search... by username"
              name="search"
              className="m-4"
            />
            <Button variant={"outline"} type="submit" className="m-4">
              <Search />
            </Button>
          </form>
          {searchContent.length > 0 ? (
            <div className="m-4">
              <h2 className="mb-2 font-semibold">Search Results:</h2>
              <ul>
                {searchContent.map((user) => (
                  <li
                    key={user._id}
                    className="p-2 border-b"
                    onClick={() => {
                      api
                        .post("/chat/private", {
                          sender: token,
                          recipient: user._id,
                        })
                        .then((response) => {
                          console.log(
                            "Private chat created or fetched:",
                            response.data
                          );
                          location.assign(`/${response.data._id}`); // Redirect to the chat page
                        });
                    }}
                  >
                    {user.username}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ChatApp;
