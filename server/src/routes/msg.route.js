import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
  handleGetLastMessageByChatId,
  handleGetAllMessagesByChatId,
  handleDeleteAllMessagesByChatId,
  handleDeleteSelectedMessagesByChatId,
} from "../controllers/msg.controller.js";
import asyncWrap from "../utils/async-wrap.js";

const msgRoute = Router();

msgRoute.route("/create").post(asyncWrap(handleCreateMessage));
msgRoute
  .route("/all/chatId/:chatId")
  .get(asyncWrap(handleGetAllMessagesByChatId))
  .delete(asyncWrap(handleDeleteAllMessagesByChatId));
msgRoute
  .route("/chatId/:chatId")
  .get(asyncWrap(handleGetMessagesByChatId))
  .delete(asyncWrap(handleDeleteSelectedMessagesByChatId));
msgRoute
  .route("/last-message/chatId/:chatId")
  .get(asyncWrap(handleGetLastMessageByChatId));

export default msgRoute;
