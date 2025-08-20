import { Router } from "express";
import {
  handleUserLogin,
  handleUserRegistration,
} from "@/controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(handleUserRegistration);
userRouter.route("/login").post(handleUserLogin);

export default userRouter;
