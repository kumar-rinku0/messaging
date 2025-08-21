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
chatRouter.route("/private/:userId").get(handleGetPrivateChat);
chatRouter.route("/:chatId").get(handleGetChatById);

export default chatRouter;
