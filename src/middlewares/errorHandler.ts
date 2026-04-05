import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) =>
      `${issue.path.join(".")}: ${issue.message}`
    );
    return sendError(res, messages.join("; "), 400);
  }

  if (err instanceof Error) {
    return sendError(res, err.message, 400);
  }

  return sendError(res, "Internal server error", 500);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
