import { z } from "zod";

const positiveInt = z.coerce.number().int().nonnegative();
const optionalPositiveInt = z.coerce.number().int().positive();

export const userValidationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const financialRecordSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export const financialRecordUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const idParamSchema = z.object({
  id: optionalPositiveInt,
});

export const paginationQuerySchema = z.object({
  skip: positiveInt.default(0),
  take: optionalPositiveInt.max(100).default(20),
});

export const recordFilterQuerySchema = paginationQuerySchema.extend({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  category: z.string().min(1).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  userId: optionalPositiveInt.optional(),
});

export const dashboardActivityQuerySchema = z.object({
  limit: optionalPositiveInt.max(50).default(10),
});

export type UserInput = z.infer<typeof userValidationSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FinancialRecordInput = z.infer<typeof financialRecordSchema>;
export type FinancialRecordUpdateInput = z.infer<typeof financialRecordUpdateSchema>;
export type RecordFilterQuery = z.infer<typeof recordFilterQuerySchema>;
