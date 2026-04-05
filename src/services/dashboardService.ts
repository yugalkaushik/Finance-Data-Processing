import prisma from "../utils/db";

type FinancialRecord = {
  id: number;
  userId: number;
  amount: number;
  type: string;
  category: string;
  date: Date;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
  };
};

type FinancialRecordWhere = {
  userId?: number;
};

export class DashboardService {
  async getSummary(userId: number, userRole: string) {
    const where: FinancialRecordWhere =
      userRole === "ADMIN"
        ? {}
        : {
            userId,
          };

    const records = await prisma.financialRecord.findMany({
      where,
    });

    const totalIncome = records
      .filter((record: FinancialRecord) => record.type === "INCOME")
      .reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);

    const totalExpense = records
      .filter((record: FinancialRecord) => record.type === "EXPENSE")
      .reduce((sum: number, record: FinancialRecord) => sum + record.amount, 0);

    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      recordCount: records.length,
    };
  }

  async getCategorySummary(userId: number, userRole: string) {
    const where: FinancialRecordWhere =
      userRole === "ADMIN"
        ? {}
        : {
            userId,
          };

    const records = await prisma.financialRecord.findMany({
      where,
    });

    const categoryMap = new Map<
      string,
      { income: number; expense: number; total: number }
    >();

    records.forEach((record: FinancialRecord) => {
      if (!categoryMap.has(record.category)) {
        categoryMap.set(record.category, {
          income: 0,
          expense: 0,
          total: 0,
        });
      }

      const cat = categoryMap.get(record.category)!;
      if (record.type === "INCOME") {
        cat.income += record.amount;
      } else {
        cat.expense += record.amount;
      }
      cat.total = cat.income - cat.expense;
    });

    return Object.fromEntries(categoryMap);
  }

  async getMonthlyTrends(userId: number, userRole: string) {
    const where: FinancialRecordWhere =
      userRole === "ADMIN"
        ? {}
        : {
            userId,
          };

    const records = await prisma.financialRecord.findMany({
      where,
      orderBy: { date: "asc" },
    });

    const trends = new Map<
      string,
      { income: number; expense: number; net: number }
    >();

    records.forEach((record: FinancialRecord) => {
      const monthKey = record.date.toISOString().substring(0, 7);

      if (!trends.has(monthKey)) {
        trends.set(monthKey, { income: 0, expense: 0, net: 0 });
      }

      const month = trends.get(monthKey)!;
      if (record.type === "INCOME") {
        month.income += record.amount;
      } else {
        month.expense += record.amount;
      }
      month.net = month.income - month.expense;
    });

    return Array.from(trends.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  async getRecentActivity(userId: number, userRole: string, limit: number = 10) {
    const where: FinancialRecordWhere =
      userRole === "ADMIN"
        ? {}
        : {
            userId,
          };

    const records = await prisma.financialRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return records.map((record: FinancialRecord) => ({
      id: record.id,
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      createdAt: record.createdAt,
      user: record.user,
    }));
  }
}

export const dashboardService = new DashboardService();
