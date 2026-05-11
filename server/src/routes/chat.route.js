import { Router } from "express";
import {
  handleCreatePrivateChat,
  handleCreateGroupChat,
  handleGetChatById,
  handleGetPrivateChats,
  handleGetGroupChats,
  handleGetAllTypeChats,
  handleUpdateChatById,
  handleDeleteChatById,
} from "../controllers/chat.controller.js";
import asyncWrap from "../utils/async-wrap.js";

const chatRoute = Router();

chatRoute.route("/group").post(asyncWrap(handleCreateGroupChat));
chatRoute.route("/private").post(asyncWrap(handleCreatePrivateChat));
chatRoute.route("/group/userId/:userId").get(asyncWrap(handleGetGroupChats));
chatRoute
  .route("/private/userId/:userId")
  .get(asyncWrap(handleGetPrivateChats));
chatRoute.route("/all/userId/:userId").get(asyncWrap(handleGetAllTypeChats));
chatRoute.route("/chatId/:chatId/update").put(asyncWrap(handleUpdateChatById));
chatRoute
  .route("/chatId/:chatId")
  .get(asyncWrap(handleGetChatById))
  .delete(asyncWrap(handleDeleteChatById));

export default chatRoute;
