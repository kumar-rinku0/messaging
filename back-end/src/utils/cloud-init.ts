import { config } from "dotenv";
config();

import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export const handleGetCloudinarySign = (req: Request, res: Response) => {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    folder: "sign_uploads",
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);

  return res.json({
    timestamp,
    signature,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
  });
};
