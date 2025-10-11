import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";

const ChatApp = () => {
  return (
    <>
      {/* mobile device view
      <div className="flex md:hidden">
        <SideNav mobile />
      </div> */}
      <div className="flex">
        <div>
          <div className="flex items-center justify-center">
            <Input placeholder="Search..." className="m-4" />
            <Button variant={"outline"} className="m-4">
              <Search />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatApp;
