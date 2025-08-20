import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const Register = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const obj = Object.fromEntries(formData.entries());
    console.log("Form Data:", obj);
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
          <Button type="submit">Register</Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
