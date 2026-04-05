import { Request, Response } from "express";
import { ZodError } from "zod";
import { userService } from "../services/userService";
import { sendSuccess, sendError } from "../utils/response";
import {
  paginationQuerySchema,
  userValidationSchema,
  userUpdateSchema,
  loginSchema,
} from "../utils/validation";

const parsePositiveId = (value: string | string[]) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const validated = userValidationSchema.parse(req.body);
      const user = await userService.createUser(validated);
      return sendSuccess(res, user, 201, "User created successfully");
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await userService.login(validated);
      return sendSuccess(res, result, 200, "Login successful");
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 401);
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }

      const user = await userService.getUserById(userId);
      return sendSuccess(res, user);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 404);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid user id", 400);
      }
      const user = await userService.getUserById(id);
      return sendSuccess(res, user);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 404);
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { skip, take } = paginationQuerySchema.parse(req.query);

      const result = await userService.getAllUsers(skip, take);
      return sendSuccess(res, result);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid user id", 400);
      }
      const validated = userUpdateSchema.parse(req.body);

      const user = await userService.updateUser(id, validated);
      return sendSuccess(res, user, 200, "User updated successfully");
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid user id", 400);
      }
      const result = await userService.deleteUser(id);
      return sendSuccess(res, result, 200);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 404);
    }
  }
}

export const userController = new UserController();
