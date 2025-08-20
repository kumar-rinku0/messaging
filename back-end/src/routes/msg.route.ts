import { Router } from "express";
import {
  handleCreateMessage,
  handleGetMessagesByChatId,
} from "@/controllers/msg.controller";

const msgRouter = Router();

msgRouter.route("/").post(handleCreateMessage);
msgRouter.route("/:chatId").get(handleGetMessagesByChatId);

export default msgRouter;
