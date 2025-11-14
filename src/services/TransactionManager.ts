import { Transaction } from "../types";
import StorageService from "./StorageService";
import { v4 as uuidv4 } from "uuid";
type Listener = (txs: Transaction[]) => void;
export default class TransactionManager {
  private storage: StorageService;
  private transactions: Transaction[] = [];
  private listeners: Listener[] = [];
  constructor(storage: StorageService) {
    this.storage = storage;
  }
  async load(): Promise<Transaction[]> {
    this.transactions = await this.storage.loadTransactions();
    this.emit();
    return this.transactions;
  }
  async addTransaction(payload: Omit<Transaction, "id">): Promise<Transaction> {
    const t: Transaction = { ...payload, id: uuidv4() };
    this.transactions = [t, ...this.transactions];
    await this.storage.saveTransactions(this.transactions);
    this.emit();
    return t;
  }
  async updateTransaction(id: string, payload: Partial<Transaction>): Promise<Transaction | null> {
    let updated: Transaction | null = null;
    this.transactions = this.transactions.map((t) => {
      if (t.id === id) {
        updated = { ...t, ...payload };
        return updated;
      }
      return t;
    });
    await this.storage.saveTransactions(this.transactions);
    this.emit();
    return updated;
  }
  async deleteTransaction(id: string): Promise<boolean> {
    const before = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    await this.storage.saveTransactions(this.transactions);
    this.emit();
    return this.transactions.length < before;
  }
  getTotalIncome(): number {
    return this.transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  }
  getTotalExpense(): number {
    return this.transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  }
  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }
  getRecent(count: number): Transaction[] {
    return this.transactions.slice(0, count);
  }
  getAll(): Transaction[] {
    return this.transactions;
  }
  getWeeklyTrend(): number[] {
    const trend = [0, 0, 0, 0, 0, 0, 0];
    for (const tx of this.transactions) {
      const d = new Date(tx.date);
      const day = d.getDay();
      const value = tx.type === "income" ? tx.amount : -tx.amount;
      trend[day] += value;
    }
    return trend;
  }
  getCategorySummary(): { category: string; total: number }[] {
    const map: Record<string, number> = {};
    for (const tx of this.transactions) {
      if (tx.type !== "expense") continue;
      if (!map[tx.category]) map[tx.category] = 0;
      map[tx.category] += tx.amount;
    }
    return Object.keys(map).map((c) => ({ category: c, total: map[c] }));
  }
  onChange(fn: Listener): void {
    this.listeners.push(fn);
  }
  private emit(): void {
    for (const l of this.listeners) l(this.transactions.slice());
  }
  async convertAllCurrencies(rate: number): Promise<void> {
    this.transactions = this.transactions.map((t) => ({ ...t, amount: t.amount * rate }));
    await this.storage.saveTransactions(this.transactions);
    this.emit();
  }
}
