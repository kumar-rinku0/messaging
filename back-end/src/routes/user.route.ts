import { Router } from "express";
import {
  handleGetAllUsers,
  handleGetSearchedUser,
  handleUserLogin,
  handleUserLogout,
  handleUserRegistration,
} from "@/controllers/user.controller";
import asyncWrap from "@/utils/async-wrap";
import { handleGetCloudinarySign } from "@/utils/cloud-init";
import { onlyLoggedInUser } from "@/middlewares/auth";

const userRouter = Router();

userRouter.route("/register").post(asyncWrap(handleUserRegistration));
userRouter.route("/login").post(asyncWrap(handleUserLogin));
userRouter.route("/logout").delete(asyncWrap(handleUserLogout));

// protected routes
userRouter.route("/all").get(onlyLoggedInUser, asyncWrap(handleGetAllUsers)); // Endpoint to get all users

userRouter
  .route("/search")
  .get(onlyLoggedInUser, asyncWrap(handleGetSearchedUser)); // Endpoint to search users (?q=someusername)

userRouter.route("/cloud-sign").get(onlyLoggedInUser, handleGetCloudinarySign);

export default userRouter;
