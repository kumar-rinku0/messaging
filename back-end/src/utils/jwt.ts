import { sign, decode, verify } from "jsonwebtoken";
import { config } from "dotenv";
config();

const KEY = process.env.SESSION_SECRET as string;

type UserType = {
  _id: string;
  username: string;
  email: string;
};

const setUser = ({ _id, username, email }: UserType) => {
  return sign(
    {
      _id,
      username,
      email,
    },
    KEY,
    {
      expiresIn: "7d",
      algorithm: "HS512",
    }
  );
};

const getInfo = (token: string) => {
  return decode(token);
};

const getUser = (token: string, accessToken = KEY) => {
  if (!token) return null;
  try {
    return verify(token, accessToken);
  } catch (err) {
    return null;
  }
};

export { setUser, getUser, getInfo };
