import StorageService from "./StorageService";
import { Transaction } from "../types";

export default class TransactionManager {
  private storage: StorageService;
  private cache: Transaction[] = [];

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async load() {
    const tx = await this.storage.loadTransactions();
    this.cache = Array.isArray(tx) ? tx : [];
  }

  getAll() {
    return this.cache;
  }

  async add(t: Transaction) {
    const fixed = {
      ...t,
      amount: Number(t.amount) || 0
    };
    this.cache.push(fixed);
    await this.storage.saveTransactions(this.cache);
  }

  getTotalIncome() {
    return this.cache
      .filter(t => t.type === "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
  }

  getTotalExpense() {
    return this.cache
      .filter(t => t.type === "expense")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
  }

  getBalance() {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  getRecent(n: number) {
    return [...this.cache].reverse().slice(0, n);
  }

  getWeeklyTrend() {
    const map: Record<string, number> = {};
    for (const t of this.cache) {
      const d = t.date.slice(0, 10);
      map[d] = (map[d] || 0) + (Number(t.amount) || 0);
    }
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  }

  getCategorySummary() {
    const map: Record<string, number> = {};
    for (const t of this.cache) {
      const c = t.category || "Other";
      const amt = Number(t.amount) || 0;
      map[c] = (map[c] || 0) + amt;
    }
    return Object.entries(map).map(([category, total]) => ({ category, total }));
  }
}
