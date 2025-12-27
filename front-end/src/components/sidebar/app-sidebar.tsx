// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ChatType, UserType } from "@/types/api-types";
import { Link } from "react-router";
import React from "react";
import api from "@/services/api";

// Menu items.
// const items = [
//   {
//     title: "Home",
//     url: "#",
//     icon: Home,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ];

export function AppSidebar() {
  const [chats, setChats] = React.useState<ChatType[]>([]);
  const auth_user_token = localStorage.getItem("auth_user") || "";
  const auth_user = JSON.parse(auth_user_token) as UserType;
  React.useEffect(() => {
    function getChats() {
      api
        .get<{ chat: ChatType[] }>(`/chat/private/userId/${auth_user._id}`)
        .then((response) => {
          setChats(response.data.chat);
        });
    }
    getChats();
  }, []);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Active Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat._id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/${chat._id}`}>
                      <span>
                        {
                          chat.members.find(
                            (member) => member._id !== auth_user._id
                          )?.username
                        }
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
