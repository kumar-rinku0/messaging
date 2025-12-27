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
  console.error("Error middleware triggered:", JSON.stringify(err));

  // Optionally: handle specific errors
  if (err.name === "MongooseError") {
    return res.status(400).json({ message: err.message, ok: false });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message, ok: false });
  }

  // Default to 500
  return res.status(500).json({ message: "Internal Server Error", ok: false });
};

export default errorMiddleware;
