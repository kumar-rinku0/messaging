"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetLastMessageByChatId = exports.handleGetMessagesByChatId = exports.handleCreateMessage = void 0;
const msg_model_1 = __importDefault(require("../models/msg.model"));
const handleCreateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, sender, msg } = req.body;
    const message = new msg_model_1.default({
        chat: chatId,
        sender,
        msg,
    });
    yield message.save();
    res.status(201).json(message);
});
exports.handleCreateMessage = handleCreateMessage;
const handleGetMessagesByChatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const messages = yield msg_model_1.default.find({ chat: chatId });
    res.status(200).json(messages);
});
exports.handleGetMessagesByChatId = handleGetMessagesByChatId;
const handleGetLastMessageByChatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const lastMessage = yield msg_model_1.default.findOne({ chat: chatId }).sort({
        createdAt: -1,
    });
    res.status(200).json(lastMessage);
});
exports.handleGetLastMessageByChatId = handleGetLastMessageByChatId;
