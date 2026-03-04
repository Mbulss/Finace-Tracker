export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  created_at: string;
}

export interface TransactionInsert {
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
}

export const CATEGORIES = {
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Other",
  ],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
} as const;
