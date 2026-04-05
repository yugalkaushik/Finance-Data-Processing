import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { AuthPayload, UserRole } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized: Missing or invalid token", 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8")) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, "Unauthorized: Invalid token", 401);
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden: Insufficient permissions", 403);
    }

    next();
  };
};
