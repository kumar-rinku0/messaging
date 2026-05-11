import { Outlet } from "react-router";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SideNav from "./sidebar/side-nav";
import socket from "@/services/socket";
import { Toaster } from "./ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { useData } from "@/hooks/use-data";

const Header = () => {
  const { isLoading, authInfo } = useAuth();
  const { dataState } = useData();
  if (isLoading || !authInfo || dataState.loading) {
    return <div>Loading...</div>;
  }
  if (dataState.error) {
    return <div>{dataState.error}</div>;
  }

  socket.auth = { userId: authInfo.auth_user._id };
  socket.connect();
  return (
    <>
      <div className="flex">
        <SideNav />
        <main className="flex-1 w-[calc(100vw-4rem)]">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </>
  );
};
export default Header;
