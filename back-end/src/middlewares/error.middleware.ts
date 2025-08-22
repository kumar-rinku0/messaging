import { Request, Response, NextFunction } from "express";

type ErrorType = {
  name: string;
  message: string;
  status: number;
};

const errorMiddleware = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error middleware triggered:", err);

  // Optionally: handle specific errors
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // Default to 500
  res.status(500).json({ message: "Internal Server Error" });
};

export default errorMiddleware;
