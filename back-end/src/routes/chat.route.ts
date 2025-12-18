import { Router } from "express";
import {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChat,
} from "@/controllers/chat.controller";

const chatRouter = Router();

chatRouter.route("/group").post(handleCreateGroupChat);
chatRouter.route("/private").post(handleCreatePrivateChat);
chatRouter.route("/private/userId/:userId").get(handleGetPrivateChat);
chatRouter.route("/chatId/:chatId").get(handleGetChatById);

export default chatRouter;
