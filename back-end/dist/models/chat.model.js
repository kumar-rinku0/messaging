"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    members: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 1,
            message: "Members must be a non-empty array with at least two members",
        },
    },
}, { timestamps: true });
const Chat = (0, mongoose_1.model)("Chat", chatSchema);
exports.default = Chat;
