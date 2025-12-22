import { NextFunction, Request, Response } from "express";
import { getUser } from "@/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const isLoggedInCheck = (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.signedCookies?.auth_token;
  const user = getUser(cookie);
  req.user = user;
  return next();
};

const onlyLoggedInUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  // }
  if (!user) {
    // throw new ExpressError(401, "session expired. login again!!");
    return res.status(401).send({ ok: false, message: "unauthorized!" });
  }
  return next();
};

export { isLoggedInCheck, onlyLoggedInUser };
