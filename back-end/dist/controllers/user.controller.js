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
exports.getOnlineUsers = exports.handleGetAllUsers = exports.handleUserLogin = exports.handleUserRegistration = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const hashing_1 = require("../utils/hashing");
const crypto_1 = __importDefault(require("crypto"));
const handleUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const newUser = new user_model_1.default({
        username,
        password,
        email,
    });
    yield newUser.save();
    res.status(201).json({ message: "User registered successfully" });
});
exports.handleUserRegistration = handleUserRegistration;
const handleUserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield user_model_1.default.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isRightPassword = (0, hashing_1.verifyPassword)(password, user.password);
    if (!isRightPassword) {
        return res.status(401).json({ message: "Invalid password" });
    }
    const token = crypto_1.default.randomBytes(32).toString("hex"); // Generate a token (use a proper library in production)
    return res.status(200).json({ message: "Login successful", user, token });
});
exports.handleUserLogin = handleUserLogin;
const handleGetAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find({});
    return res.status(200).json({ users: users });
});
exports.handleGetAllUsers = handleGetAllUsers;
const getOnlineUsers = (onlineUsers) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find({
        _id: { $in: onlineUsers.map((user) => user.userId) },
    }).select("-password -email -__v");
    return users;
});
exports.getOnlineUsers = getOnlineUsers;
