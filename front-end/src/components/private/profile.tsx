import { useAuth } from "@/hooks/use-auth";
import { Edit, LogOut, Trash } from "lucide-react";
import { Button } from "../ui/button";
import ChangeAvatar, { saveImage } from "./change-avatar";
import api from "@/services/api";
import React from "react";
const dummyImg =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

const Profile = () => {
  const { authInfo, logout, updateAuthUser } = useAuth();
  if (!authInfo) {
    return null;
  }
  const { auth_user } = authInfo;
  const [showChangeAvatar, setShowChangeAvatar] = React.useState<{
    img: boolean;
    details: boolean;
    images: { url: string; asset_id: string }[];
  }>({
    img: false,
    details: false,
    images: [],
  });

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
        {showChangeAvatar.img ? (
          <div>
            {showChangeAvatar.images.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {showChangeAvatar.images.map((img) => (
                  <div
                    key={img.asset_id}
                    className="relative w-16 h-16 flex justify-center items-center"
                  >
                    <img
                      key={img.asset_id}
                      src={img.url}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover"
                      onClick={() => {
                        saveImage({
                          url: img.url,
                          asset_id: img.asset_id,
                        }).then(async (user) => {
                          console.log(user);
                          await updateAuthUser(user);
                          setShowChangeAvatar((prev) => ({
                            ...prev,
                            details: false,
                          }));
                        });
                      }}
                    />
                    <Button
                      variant="destructive"
                      className="absolute -bottom-2 -right-2"
                      size="sm"
                      onClick={() =>
                        api
                          .delete("/user/cloud-images?assetId=" + img.asset_id)
                          .then(() => {
                            console.log(
                              "Deleted image with asset_id:",
                              img.asset_id,
                            );
                            setShowChangeAvatar((prev) => ({
                              ...prev,
                              images: prev.images.filter(
                                (i) => i.asset_id !== img.asset_id,
                              ),
                            }));
                          })
                      }
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <Button
            onClick={() => {
              api
                .get(
                  "/user/cloud-images?origin=profile_pics&path=" +
                    auth_user._id,
                )
                .then((res) => {
                  console.log(res.data);
                  setShowChangeAvatar((prev) => ({
                    ...prev,
                    img: true,
                    details: true,
                    images: res.data.images.map((img: any) => ({
                      url: img.secure_url,
                      asset_id: img.asset_id,
                    })),
                  }));
                });
            }}
          >
            Change Avatar
          </Button>
        )}
        {showChangeAvatar.details && <ChangeAvatar />}
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
