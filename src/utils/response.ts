import { Response } from "express";
import { ApiResponse } from "../types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message: string = "Success"
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
  } as ApiResponse<null>);
};
