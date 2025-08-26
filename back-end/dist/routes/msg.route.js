"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const msg_controller_1 = require("../controllers/msg.controller");
const msgRouter = (0, express_1.Router)();
msgRouter.route("/").post(msg_controller_1.handleCreateMessage);
msgRouter.route("/messages/:chatId").get(msg_controller_1.handleGetMessagesByChatId);
msgRouter.route("/last-message/:chatId").get(msg_controller_1.handleGetLastMessageByChatId);
exports.default = msgRouter;
