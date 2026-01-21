import api from "@/services/api";
import type { UserType } from "@/types/api-types";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  authInfo: AuthInfoType | null;
  isLoading: boolean;
  login: (
    auth_token: string,
    auth_user: UserType,
    session_id: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateAuthUser: (auth_user: UserType) => Promise<void>;
};

type AuthInfoType = {
  auth_user: UserType;
  auth_token: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authInfo, setAuthInfo] = useState<AuthInfoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      const token = localStorage.getItem("auth_token");
      const stringAuthUser = localStorage.getItem("auth_user");
      const parsed = JSON.parse(stringAuthUser!);
      if (token) {
        setAuthInfo({ auth_token: token, auth_user: parsed });
      } else {
        setAuthInfo(null);
      }
      setIsLoading(false);
    };

    loadToken();
  }, []);

  const login = async (
    auth_token: string,
    auth_user: UserType,
    session_id: string,
  ) => {
    localStorage.setItem("session_id", session_id);
    localStorage.setItem("auth_token", auth_token);
    const stringAuthUser = JSON.stringify(auth_user!);
    localStorage.setItem("auth_user", stringAuthUser);
    setAuthInfo({ auth_user: auth_user, auth_token: stringAuthUser });
  };

  const logout = async () => {
    const { data } = await api<{ ok: boolean; message: string }>(
      "/user/logout",
      { method: "DELETE" },
    );
    console.log(data);
    if (!data.ok) {
      alert(data.message);
      return;
    }
    localStorage.removeItem("session_id");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthInfo(null);
  };

  const updateAuthUser = async (auth_user: UserType) => {
    if (!authInfo) return;
    const stringAuthUser = JSON.stringify(auth_user!);
    localStorage.setItem("auth_user", stringAuthUser);
    setAuthInfo({ auth_user: auth_user, auth_token: stringAuthUser });
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { authInfo, isLoading, login, logout, updateAuthUser } },
    children,
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
