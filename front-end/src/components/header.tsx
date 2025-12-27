import { Outlet } from "react-router";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SideNav from "./sidebar/side-nav";
import socket from "@/services/socket";
import { Toaster } from "./ui/sonner";
import type { UserType } from "@/types/api-types";

const Header = () => {
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  socket.auth = { userId: auth_user._id };
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
