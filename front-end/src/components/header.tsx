import { Outlet } from "react-router";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SideNav from "./sidebar/side-nav";
import socket from "@/services/socket";
import { Toaster } from "./ui/sonner";
import type { UserType } from "@/types/api-types";

const Header = () => {
  const auth_user = localStorage.getItem("auth_user") || "";
  const user = JSON.parse(auth_user) as UserType;
  socket.auth = { userId: user._id };
  socket.connect();
  return (
    <>
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </>
  );
};
export default Header;
