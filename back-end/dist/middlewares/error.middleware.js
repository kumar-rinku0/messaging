"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, req, res, next) => {
    console.error("Error middleware triggered:", err);
    // Optionally: handle specific errors
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    // Default to 500
    res.status(500).json({ message: "Internal Server Error" });
};
exports.default = errorMiddleware;
