import { Request, Response } from "express";
import { ZodError } from "zod";
import { recordService } from "../services/recordService";
import { sendSuccess, sendError } from "../utils/response";
import {
  financialRecordSchema,
  financialRecordUpdateSchema,
  recordFilterQuerySchema,
} from "../utils/validation";

const parsePositiveId = (value: string | string[]) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const id = Number(rawValue);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export class RecordController {
  async createRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, "Unauthorized", 401);
      }

      const validated = financialRecordSchema.parse(req.body);
      const record = await recordService.createRecord(userId, validated);
      return sendSuccess(res, record, 201, "Record created successfully");
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async getRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid record id", 400);
      }
      const record = await recordService.getRecord(id, userId, userRole);
      return sendSuccess(res, record);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      if (error instanceof Error && error.message === "Record not found") {
        return sendError(res, error.message, 404);
      }
      if (error instanceof Error && error.message.startsWith("Unauthorized")) {
        return sendError(res, error.message, 403);
      }
      return sendError(res, error.message, 404);
    }
  }

  async getRecords(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const query = recordFilterQuerySchema.parse(req.query);

      const result = await recordService.getRecords(userId, userRole, query);
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

  async updateRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const validated = financialRecordUpdateSchema.parse(req.body);
      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid record id", 400);
      }
      const record = await recordService.updateRecord(id, userId, userRole, validated);
      return sendSuccess(res, record, 200, "Record updated successfully");
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  async deleteRecord(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return sendError(res, "Unauthorized", 401);
      }

      const id = parsePositiveId(req.params.id);
      if (!id) {
        return sendError(res, "Invalid record id", 400);
      }
      const result = await recordService.deleteRecord(id, userId, userRole);
      return sendSuccess(res, result, 200);
    } catch (error: any) {
      const issues = error?.issues;
      if (Array.isArray(issues)) {
        const message = issues.map((issue: { path: Array<string | number>; message: string }) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
        return sendError(res, message, 400);
      }
      if (error instanceof Error && error.message === "Record not found") {
        return sendError(res, error.message, 404);
      }
      if (error instanceof Error && error.message.startsWith("Unauthorized")) {
        return sendError(res, error.message, 403);
      }
      return sendError(res, error.message, 404);
    }
  }
}

export const recordController = new RecordController();
