import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
}
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err); // log error

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
