import { getUser } from "../utils/jwt.js";

const isLoggedInCheck = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = getUser(token);
  req.user = user;
  return next();
};

const onlyLoggedInUser = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).send({ ok: false, message: "unauthorized!" });
  }
  return next();
};

export { isLoggedInCheck, onlyLoggedInUser };
