import api from "@/services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const obj = Object.fromEntries(formData.entries());
    console.log("Form Data:", obj);
    api
      .post("/user/register", obj)
      .then((response) => {
        console.log("Registration successful:", response.data);
        const auth_user = JSON.stringify(response.data.user);
        localStorage.setItem("auth_user", auth_user);
        localStorage.setItem("auth_token", response.data.auth_token);
        location.reload();
      })
      .catch((error) => {
        setError(error.response?.data?.message || "Registration failed");
        console.error("Registration failed:", error);
      });
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-sm flex flex-col space-y-4">
        <h1>Register Page</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div>
            <Label htmlFor="username">Username:</Label>
            <Input type="text" id="username" name="username" required />
          </div>
          <div>
            <Label htmlFor="email">Email:</Label>
            <Input type="email" id="email" name="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password:</Label>
            <Input type="password" id="password" name="password" required />
          </div>
          <div>{error && <p className="text-red-500">{error}</p>}</div>
          <Button type="submit">Register</Button>
          <a href="/" className="text-blue-500 hover:underline">
            Already have an account? Login
          </a>
        </form>
      </div>
    </div>
  );
};

export default Register;
