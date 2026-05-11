import jwt from "jsonwebtoken";
const { sign, decode, verify } = jwt;
import { config } from "dotenv";
config();

const KEY = process.env.SESSION_SECRET;

const setUser = ({ _id, username, avatar, email }) => {
  return sign(
    {
      _id,
      username,
      avatar,
      email,
    },
    KEY,
    {
      expiresIn: "7d",
      algorithm: "HS512",
    },
  );
};

const getInfo = (token) => {
  return decode(token);
};

const getUser = (token, accessToken = KEY) => {
  if (!token) return null;
  try {
    return verify(token, accessToken);
  } catch (err) {
    return null;
  }
};

export { setUser, getUser, getInfo };
