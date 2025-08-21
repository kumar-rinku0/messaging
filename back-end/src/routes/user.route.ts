import { Router } from "express";
import {
  handleGetAllUsers,
  handleUserLogin,
  handleUserRegistration,
} from "@/controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(handleUserRegistration);
userRouter.route("/login").post(handleUserLogin);
userRouter.route("/all").get(handleGetAllUsers); // Endpoint to get all users

export default userRouter;
