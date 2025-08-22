import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
} from "@/controllers/msg.controller";

const msgRouter = Router();

msgRouter.route("/").post(handleCreateMessage);
msgRouter.route("/messages/:chatId").get(handleGetMessagesByChatId);
msgRouter.route("/last-message/:chatId").get(handleGetLastMessageByChatId);

export default msgRouter;
