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
  const token = req.headers.authorization?.split(" ")[1];
  const user = getUser(token);
  req.user = user;
  return next();
};

const onlyLoggedInUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return res.status(401).send({ ok: false, message: "unauthorized!" });
  }
  return next();
};

export { isLoggedInCheck, onlyLoggedInUser };
