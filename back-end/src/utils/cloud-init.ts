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
  const { origin, path } = req.query as { origin?: string; path?: string };
  const timestamp = Math.round(Date.now() / 1000);

  const folderToUse = origin && path ? `${origin}/${path}` : "sign_uploads";

  const paramsToSign = {
    timestamp,
    folder: folderToUse,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);

  return res.json({
    timestamp,
    signature,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
  });
};

export async function getImages(req: Request, res: Response) {
  const { origin, path } = req.query as { origin?: string; path?: string };
  const prefix = origin && path ? `${origin}/${path}` : "sign_uploads";
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix,
    resource_type: "image",
    max_results: 500,
  });

  console.log(result.resources);
  return res.json({
    images: result.resources,
    ok: true,
  });
}
export async function deleteImage(req: Request, res: Response) {
  const { assetId } = req.query as { assetId: string };
  await cloudinary.api.delete_resources([assetId]);
  return res.json({ ok: true, message: "Image deleted successfully" });
}
