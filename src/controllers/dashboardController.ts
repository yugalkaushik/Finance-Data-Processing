import { Request, Response } from "express";
import { ZodError } from "zod";
import { dashboardService } from "../services/dashboardService";
import { sendSuccess, sendError } from "../utils/response";
import { dashboardActivityQuerySchema } from "../utils/validation";

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const summary = await dashboardService.getSummary(userId, userRole);
      return sendSuccess(res, summary);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async getCategorySummary(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const summary = await dashboardService.getCategorySummary(userId, userRole);
      return sendSuccess(res, summary);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async getMonthlyTrends(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const trends = await dashboardService.getMonthlyTrends(userId, userRole);
      return sendSuccess(res, trends);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const { limit } = dashboardActivityQuerySchema.parse(req.query);

      const activity = await dashboardService.getRecentActivity(
        userId,
        userRole,
        limit
      );
      return sendSuccess(res, activity);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }
}

export const dashboardController = new DashboardController();
