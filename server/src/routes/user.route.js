import { Router } from "express";
import {
  handleGetAllUsers,
  handleGetSearchedUser,
  handleUserLogin,
  handleUserLogout,
  handleUserRegistration,
  handleUpdateUserDetails,
} from "../controllers/user.controller.js";
import asyncWrap from "../utils/async-wrap.js";
import {
  getImages,
  handleGetCloudinarySign,
  deleteImage,
} from "../utils/cloud-init.js";
import { onlyLoggedInUser } from "../middlewares/auth.js";

const userRoute = Router();

userRoute.route("/register").post(asyncWrap(handleUserRegistration));
userRoute.route("/login").post(asyncWrap(handleUserLogin));
userRoute.route("/logout").delete(asyncWrap(handleUserLogout));

// protected routes
userRoute.route("/all").get(onlyLoggedInUser, asyncWrap(handleGetAllUsers)); // Endpoint to get all users

userRoute
  .route("/update")
  .put(onlyLoggedInUser, asyncWrap(handleUpdateUserDetails));

userRoute
  .route("/search")
  .get(onlyLoggedInUser, asyncWrap(handleGetSearchedUser)); // Endpoint to search users (?q=someusername)

userRoute.route("/cloud-sign").get(onlyLoggedInUser, handleGetCloudinarySign);
userRoute
  .route("/cloud-images")
  .get(onlyLoggedInUser, asyncWrap(getImages))
  .delete(onlyLoggedInUser, asyncWrap(deleteImage));

export default userRoute;
