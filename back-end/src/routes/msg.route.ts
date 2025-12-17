import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
  handleGetAllMessagesByChatId,
} from "@/controllers/msg.controller";

const msgRouter = Router();

msgRouter.route("/").post(handleCreateMessage);
msgRouter.route("/all/chatId/:chatId").get(handleGetAllMessagesByChatId);
msgRouter.route("/messages/:chatId").get(handleGetMessagesByChatId);
msgRouter.route("/last-message/:chatId").get(handleGetLastMessageByChatId);

export default msgRouter;
