import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import api from "@/services/api";
import { useState } from "react";

type ResponseType = {
  users: {
    _id: string;
    username: string;
  }[];
  message: string;
};

const ChatApp = () => {
  const token = localStorage.getItem("token");
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
