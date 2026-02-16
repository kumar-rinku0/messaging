import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
  handleGetAllMessagesByChatId,
  handleDeleteAllMessagesByChatId,
  handleDeleteSelectedMessagesByChatId,
} from "@/controllers/msg.controller";

const msgRouter = Router();

msgRouter.route("/create").post(handleCreateMessage);
msgRouter
  .route("/all/chatId/:chatId")
  .get(handleGetAllMessagesByChatId)
  .delete(handleDeleteAllMessagesByChatId);
msgRouter
  .route("/chatId/:chatId")
  .get(handleGetMessagesByChatId)
  .delete(handleDeleteSelectedMessagesByChatId);
msgRouter
  .route("/last-message/chatId/:chatId")
  .get(handleGetLastMessageByChatId);

export default msgRouter;
