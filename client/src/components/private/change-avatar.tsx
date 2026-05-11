import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import React from "react";
import api from "@/services/api";

import type { UserType } from "@/types/api-types";
import { useAuth } from "@/hooks/use-auth";
import { Upload } from "lucide-react";

type ResponseTypeOne = {
  signature: string;
  timestamp: string;
  cloudName: string;
  apiKey: string;
};

type ResponseTypeTwo = {
  updatedUser: UserType;
  ok: boolean;
  message: string;
};

const getSignature = async (path: string) => {
  const data = await api
    .get<ResponseTypeOne>(`/user/cloud-sign?origin=profile_pics&path=${path}`)
    .then((res) => res.data);
  return data;
};

export const saveImage = async ({
  url,
  asset_id,
}: {
  url: string;
  asset_id: string;
}) => {
  const data = await api
    .put<ResponseTypeTwo>("/user/update", { avatar: url, asset_id })
    .then((res) => res.data);
  // console.log(data);
  if (!data.ok) {
    console.error(data.message);
  }
  return data.updatedUser;
};

const ChangeAvatar = () => {
  const { authInfo, updateAuthUser } = useAuth();
  if (!authInfo) {
    return null;
  }
  const { auth_user } = authInfo;
  const [loading, setLoading] = React.useState(false);
  const [image, setImage] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files ? e.target.files[0] : null);
  };

  const uploadImage = async () => {
    if (!image) return;
    setLoading(true);
    const { signature, timestamp, cloudName, apiKey } = await getSignature(
      auth_user._id,
    );

    const data = new FormData();
    data.append("file", image);
    data.append("api_key", apiKey); // safe, can be public
    data.append("timestamp", timestamp);
    data.append("signature", signature);
    data.append("folder", `profile_pics/${auth_user._id}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data },
    );
    const result = await response.json();
    console.log("Cloudinary result:", result);
    const { secure_url, asset_id } = result;
    const user = await saveImage({
      url: secure_url.replace("/upload", "/upload/q_auto/ar_1:1,c_fill"),
      asset_id,
    });
    await updateAuthUser(user);
    setLoading(false);
    setImage(null);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-start gap-2">
        <Label htmlFor="avatar-upload">Select Manual</Label>
        <Input
          type="file"
          id="avatar-upload"
          accept="image/*"
          // className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {/* <label htmlFor="avatar-upload" className="flex gap-2 cursor-pointer">
            <span>Change Avatar</span>
          </label> */}
      {image && (
        <div className="flex items-center gap-2">
          <div className="relative w-16 h-16 flex justify-center items-center">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <Button onClick={uploadImage} disabled={loading} size="lg">
            Upload <Upload className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChangeAvatar;
