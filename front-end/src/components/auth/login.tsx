import api from "@/services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import React from "react";
import { getOS } from "@/utils/session";

const Login = () => {
  const [error, setError] = React.useState<string | null>(null);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const obj = Object.fromEntries(formData.entries());
    console.log("Form Data:", obj);
    const newObj = {
      ...obj,
      client: {
        os: getOS(),
      },
    };
    api
      .post("/user/login", newObj)
      .then((response) => {
        console.log("Login successful:", response.data);
        const auth_user = JSON.stringify(response.data.user);
        localStorage.setItem("auth_user", auth_user);
        localStorage.setItem("auth_token", response.data.auth_token);
        localStorage.setItem("session_id", response.data.session_id);
        location.reload();
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Login failed");
        console.error("Login failed:", error);
      });
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-sm flex flex-col space-y-4">
        <h1>Login Page</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div>
            <Label htmlFor="username">Username:</Label>
            <Input type="text" id="username" name="username" required />
          </div>
          <div>
            <Label htmlFor="password">Password:</Label>
            <Input type="password" id="password" name="password" required />
          </div>
          <div>{error && <p className="text-red-500">{error}</p>}</div>
          <Button type="submit">Login</Button>
          <a href="/register" className="text-blue-500 hover:underline">
            Don't have an account? Register
          </a>
        </form>
      </div>
    </div>
  );
};

export default Login;
