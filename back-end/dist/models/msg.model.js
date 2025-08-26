"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const msgSchema = new mongoose_1.Schema({
    chat: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    msg: {
        type: String,
        required: true,
    },
}, { timestamps: true });
const Message = (0, mongoose_1.model)("Message", msgSchema);
exports.default = Message;
