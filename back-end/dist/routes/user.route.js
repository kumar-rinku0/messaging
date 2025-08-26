"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const userRouter = (0, express_1.Router)();
userRouter.route("/register").post(user_controller_1.handleUserRegistration);
userRouter.route("/login").post(user_controller_1.handleUserLogin);
userRouter.route("/all").get(user_controller_1.handleGetAllUsers); // Endpoint to get all users
exports.default = userRouter;
