export type UserRole = "VIEWER" | "ANALYST" | "ADMIN";

export interface AuthPayload {
  userId: number;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  skip?: number;
  take?: number;
}

export interface RecordFilterQuery extends PaginationQuery {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: "INCOME" | "EXPENSE";
  userId?: number;
}
