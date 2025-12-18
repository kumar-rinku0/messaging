import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
  handleGetAllMessagesByChatId,
} from "@/controllers/msg.controller";

const msgRouter = Router();

msgRouter.route("/create").post(handleCreateMessage);
msgRouter.route("/all/chatId/:chatId").get(handleGetAllMessagesByChatId);
msgRouter.route("/chatId/:chatId").get(handleGetMessagesByChatId);
msgRouter
  .route("/last-message/chatId/:chatId")
  .get(handleGetLastMessageByChatId);

export default msgRouter;
