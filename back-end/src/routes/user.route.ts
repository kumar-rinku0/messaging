import { Router } from "express";
import {
  handleGetAllUsers,
  handleGetSearchedUser,
  handleUserLogin,
  handleUserLogout,
  handleUserRegistration,
} from "@/controllers/user.controller";
import asyncWrap from "@/utils/async-wrap";

const userRouter = Router();

userRouter.route("/register").post(asyncWrap(handleUserRegistration));
userRouter.route("/login").post(asyncWrap(handleUserLogin));
userRouter.route("/logout").delete(asyncWrap(handleUserLogout));
userRouter.route("/all").get(asyncWrap(handleGetAllUsers)); // Endpoint to get all users
userRouter.route("/search").get(asyncWrap(handleGetSearchedUser)); // Endpoint to search users (?q=someusername)

export default userRouter;
