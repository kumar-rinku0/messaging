import { Outlet } from "react-router";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SideNav from "./sidebar/side-nav";
import socket from "@/services/socket";

const Header = () => {
  const token = localStorage.getItem("token");
  socket.auth = { userId: token };
  socket.connect();
  return (
    <>
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* 
      mobile device view
      <div className="md:hidden">
        <Outlet />
      </div> */}
    </>
  );
  // return (
  //   <SidebarProvider>
  //     <AppSidebar />
  //     <main>
  //       <SidebarTrigger />
  //       <Outlet />
  //     </main>
  //   </SidebarProvider>
  // );
};
export default Header;
