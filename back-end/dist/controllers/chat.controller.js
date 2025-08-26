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
exports.handleGetPrivateChat = exports.handleGetChatById = exports.handleCreateGroupChat = exports.handleCreatePrivateChat = void 0;
const chat_model_1 = __importDefault(require("../models/chat.model"));
const handleCreatePrivateChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sender, recipient } = req.body;
    const oldChat = yield chat_model_1.default.findOne({
        members: { $all: [sender, recipient] },
        name: "private-chat",
    });
    if (!oldChat) {
        const chat = new chat_model_1.default({
            name: "private-chat",
            members: [sender, recipient],
        });
        yield chat.save();
        return res.status(201).json(chat);
    }
    return res.status(200).json(oldChat);
});
exports.handleCreatePrivateChat = handleCreatePrivateChat;
const handleCreateGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, members } = req.body;
    const chat = new chat_model_1.default({
        name,
        members,
    });
    yield chat.save();
    res.status(201).json(chat);
});
exports.handleCreateGroupChat = handleCreateGroupChat;
const handleGetChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const chat = yield chat_model_1.default.findById(chatId).populate("members");
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(chat);
});
exports.handleGetChatById = handleGetChatById;
const handleGetPrivateChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const chat = yield chat_model_1.default.find({
        members: { $all: [userId] },
        name: "private-chat",
    }).populate("members");
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(chat);
});
exports.handleGetPrivateChat = handleGetPrivateChat;
