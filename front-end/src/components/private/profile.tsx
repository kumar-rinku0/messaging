import { useAuth } from "@/hooks/use-auth";
import { Edit, LogOut, Upload } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import api from "@/services/api";
import { Label } from "../ui/label";
import type { UserType } from "@/types/api-types";
const dummyImg =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

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

const getSignature = async () => {
  const data = await api
    .get<ResponseTypeOne>("/user/cloud-sign")
    .then((res) => res.data);
  return data;
};

const saveImage = async ({
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

const Profile = () => {
  const { authInfo, updateAuthUser, logout } = useAuth();
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
    const { signature, timestamp, cloudName, apiKey } = await getSignature();

    const data = new FormData();
    data.append("file", image);
    data.append("api_key", apiKey); // safe, can be public
    data.append("timestamp", timestamp);
    data.append("signature", signature);
    data.append("folder", "sign_uploads");

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
    <div className="p-4">
      <div className="flex justify-center items-center h-[40vh]">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 flex justify-center items-center">
            <img
              src={auth_user.avatar ?? dummyImg}
              alt="Profile Picture"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <h2 className="text-4xl font-bold">{auth_user?.username}</h2>
            <p className="text-gray-600">{auth_user.email}</p>
          </div>
        </div>
      </div>
      <div className="h-[20vh] flex flex-col gap-4 items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="avatar-upload">Change Avatar</Label>
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
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span>{auth_user?.username}</span>
          <Button variant="outline" size="sm">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>{auth_user?.email}</span>
          <Button variant="outline" size="sm">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>Log Out</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
