const errorMiddleware = (err, req, res, next) => {
  console.error("Error middleware triggered:", err);

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
