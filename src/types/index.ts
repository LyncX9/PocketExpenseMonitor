export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
  note?: string;
};

export type AppSettings = {
  currency: string;
  monthlyBudget: number;
  alertThreshold: number;
  budgetAlertsEnabled: boolean;
  categoryBudgets: Record<string, number>;
};
