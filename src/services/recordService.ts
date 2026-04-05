import prisma from "../utils/db";
import {
  FinancialRecordInput,
  FinancialRecordUpdateInput,
  RecordFilterQuery,
} from "../utils/validation";

type FinancialRecord = {
  id: number;
  userId: number;
  amount: number;
  type: string;
  category: string;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type FinancialRecordWhere = {
  userId?: number;
  type?: string;
  category?: {
    contains: string;
  };
  date?: {
    gte?: Date;
    lte?: Date;
  };
};

type FinancialRecordUpdateData = {
  amount?: number;
  type?: string;
  category?: string;
  date?: Date;
  notes?: string | null;
};

type FinancialRecordCreateData = {
  userId: number;
  amount: number;
  type: string;
  category: string;
  date: Date;
  notes: string | null;
};

export class FinancialRecordService {
  async createRecord(userId: number, input: FinancialRecordInput) {
    const data: FinancialRecordCreateData = {
      userId,
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      notes: input.notes || null,
    };

    const record = await prisma.financialRecord.create({
      data,
    });

    return record;
  }

  async getRecord(id: number, userId: number, userRole: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error("Record not found");
    }

    if (userRole !== "ADMIN" && record.userId !== userId) {
      throw new Error("Unauthorized to view this record");
    }

    return record;
  }

  async getRecords(userId: number, userRole: string, query: RecordFilterQuery) {
    const skip = query.skip ?? 0;
    const take = query.take ?? 20;

    const where: FinancialRecordWhere = {};

    if (userRole !== "ADMIN") {
      where.userId = userId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = {
        contains: query.category,
      };
    }

    if (query.startDate || query.endDate) {
      where.date = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take,
        orderBy: { date: "desc" },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      records,
      total,
      skip,
      take,
    };
  }

  async updateRecord(
    id: number,
    userId: number,
    userRole: string,
    input: FinancialRecordUpdateInput
  ) {
    const record = await prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error("Record not found");
    }

    if (userRole !== "ADMIN" && record.userId !== userId) {
      throw new Error("Unauthorized to update this record");
    }

    const updateData: FinancialRecordUpdateData = {};

    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.type) updateData.type = input.type;
    if (input.category) updateData.category = input.category;
    if (input.date) updateData.date = input.date;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteRecord(id: number, userId: number, userRole: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new Error("Record not found");
    }

    if (userRole !== "ADMIN" && record.userId !== userId) {
      throw new Error("Unauthorized to delete this record");
    }

    await prisma.financialRecord.delete({
      where: { id },
    });

    return { message: "Record deleted successfully" };
  }
}

export const recordService = new FinancialRecordService();
