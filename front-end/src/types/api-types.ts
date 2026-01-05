export type MessageType = {
  _id: string;
  msg: string;
  sender: string;
  chat: string;
  createdAt: Date;
};

export type UserType = {
  username: string;
  _id: string;
};

export type ChatType = {
  _id: string;
  displayName: string;
  displayAvatar: string;
  type: "group" | "private";
  members: UserType[];
};
