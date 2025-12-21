import { Router } from "express";
import {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChats,
  handleGetGroupChats,
  handleGetAllTypeChats,
} from "@/controllers/chat.controller";

const chatRouter = Router();

chatRouter.route("/group").post(handleCreateGroupChat);
chatRouter.route("/private").post(handleCreatePrivateChat);
chatRouter.route("/group/userId/:userId").get(handleGetGroupChats);
chatRouter.route("/private/userId/:userId").get(handleGetPrivateChats);
chatRouter.route("/all/userId/:userId").get(handleGetAllTypeChats);
chatRouter.route("/chatId/:chatId").get(handleGetChatById);

export default chatRouter;
