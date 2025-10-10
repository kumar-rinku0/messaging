import { Router } from "express";
import {
  handleGetAllUsers,
  handleUserLogin,
  handleUserRegistration,
} from "@/controllers/user.controller";
import asyncWrap from "@/utils/async-wrap";

const userRouter = Router();

userRouter.route("/register").post(asyncWrap(handleUserRegistration));
userRouter.route("/login").post(asyncWrap(handleUserLogin));
userRouter.route("/all").get(asyncWrap(handleGetAllUsers)); // Endpoint to get all users

export default userRouter;
