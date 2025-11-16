import StorageService from "./StorageService";
import { Transaction } from "../types";
const uuidv4 = (): string => {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
};

export default class TransactionManager {
  private storage: StorageService;
  private cache: Transaction[] = [];
  private repairFlag = false;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  private cleanNumber(v: any): number {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") {
      if (!Number.isFinite(v) || Number.isNaN(v)) return 0;
      return v;
    }
    if (typeof v !== "string") return 0;
    
    let s = String(v).trim().replace(/\s/g, "");
    if (s === "" || s === "-" || s === "." || s === "-.") return 0;
    
    s = s.replace(/[^\d.,-]/g, "");
    if (s === "" || s === "-") return 0;
    
    const hasComma = s.includes(",");
    const hasDot = s.includes(".");
    const dotCount = (s.match(/\./g) || []).length;
    const commaCount = (s.match(/,/g) || []).length;
    
    if (hasComma && hasDot) {
      const lastComma = s.lastIndexOf(",");
      const lastDot = s.lastIndexOf(".");
      if (lastComma > lastDot) {
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (hasComma && !hasDot) {
      if (commaCount === 1 && s.split(",")[1]?.length <= 2) {
        s = s.replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (hasDot && !hasComma) {
      if (dotCount === 1 && s.split(".")[1]?.length <= 2) {
      } else {
        s = s.replace(/\./g, "");
      }
    }
    
    s = s.replace(/[^\d.-]/g, "");
    if (s === "" || s === "-" || s === "." || s === "-.") return 0;
    
    const n = Number(s);
    if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
    return n;
  }

  private normalizeDate(d: any): string {
    if (!d) return new Date().toISOString();
    if (typeof d === "string") {
      const parsed = Date.parse(d);
      return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
    }
    if (d instanceof Date) {
      return isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
    }
    return new Date().toISOString();
  }

  private repairTransaction(t: any): Transaction {
    const cleaned: Transaction = {
      id: String(t?.id || ""),
      title: String(t?.title || ""),
      amount: this.cleanNumber(t?.amount),
      category: String(t?.category || "Other"),
      type: (t?.type === "income" || t?.type === "expense") ? t.type : "expense",
      date: this.normalizeDate(t?.date),
      note: t?.note ? String(t.note) : undefined,
      originalCurrency: t?.originalCurrency ? String(t.originalCurrency) : undefined,
      originalAmount: t?.originalAmount !== undefined ? this.cleanNumber(t.originalAmount) : undefined
    };
    
    if (!cleaned.id) {
      cleaned.id = uuidv4();
    }
    
    return cleaned;
  }

  async load(): Promise<void> {
    const tx = await this.storage.loadTransactions();
    const repaired = Array.isArray(tx) ? tx.map(t => this.repairTransaction(t)) : [];
    
    const needsSave = repaired.some((r, i) => {
      const orig = tx[i];
      return orig && (orig.amount !== r.amount || orig.date !== r.date || orig.id !== r.id);
    });
    
    if (needsSave || !this.repairFlag) {
      this.cache = repaired;
      await this.storage.saveTransactions(this.cache);
      this.repairFlag = true;
    } else {
      this.cache = repaired;
    }
  }

  getAll(): Transaction[] {
    return this.cache;
  }

  async add(t: Transaction, originalCurrency?: string, originalAmount?: number): Promise<void> {
    const fixed = this.repairTransaction(t);
    if (originalCurrency && originalAmount !== undefined) {
      fixed.originalCurrency = originalCurrency;
      fixed.originalAmount = originalAmount;
    }
    this.cache.push(fixed);
    await this.storage.saveTransactions(this.cache);
  }

  async addTransaction(t: Omit<Transaction, "id">, originalCurrency?: string, originalAmount?: number): Promise<Transaction> {
    const fixed = this.repairTransaction({ ...t, id: uuidv4() });
    if (originalCurrency && originalAmount !== undefined) {
      fixed.originalCurrency = originalCurrency;
      fixed.originalAmount = originalAmount;
    }
    this.cache.push(fixed);
    await this.storage.saveTransactions(this.cache);
    return fixed;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const before = this.cache.length;
    this.cache = this.cache.filter(t => t.id !== id);
    if (this.cache.length !== before) {
      await this.storage.saveTransactions(this.cache);
      return true;
    }
    return false;
  }


  getBalance(currencyService?: any, targetCurrency?: string): number {
    return this.getTotalIncome(currencyService, targetCurrency) - this.getTotalExpense(currencyService, targetCurrency);
  }

  getRecent(n: number): Transaction[] {
    return [...this.cache].reverse().slice(0, n);
  }

  getWeeklyTrend(currencyService?: any, targetCurrency?: string): { date: string; balance: number }[] {
    const sorted = [...this.cache].sort((a, b) => {
      const dateA = new Date(this.normalizeDate(a.date)).getTime();
      const dateB = new Date(this.normalizeDate(b.date)).getTime();
      return dateA - dateB;
    });

    const map: Record<string, number> = {};
    let runningBalance = 0;

    for (const t of sorted) {
      const iso = this.normalizeDate(t.date);
      const d = iso.slice(0, 10);
      
      let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
      
      if (currencyService && targetCurrency) {
        if (t.originalCurrency !== undefined && t.originalAmount !== undefined) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          const base = typeof currencyService.getBaseCurrency === "function" ? currencyService.getBaseCurrency() : "IDR";
          amt = currencyService.convert(amt, base, targetCurrency);
        }
      }
      
      if (t.type === "income") {
        runningBalance += amt;
      } else {
        runningBalance -= amt;
      }
      
      if (!map[d] || new Date(d).getTime() > new Date(Object.keys(map).find(k => map[k] === runningBalance) || d).getTime()) {
        map[d] = runningBalance;
      }
    }
    
    return Object.entries(map)
      .map(([date, balance]) => ({ 
        date, 
        balance: typeof balance === "number" && Number.isFinite(balance) ? balance : 0 
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getCategorySummary(currencyService?: any, targetCurrency?: string): { category: string; total: number }[] {
    const map: Record<string, number> = {};
    for (const t of this.cache) {
      if (t.type !== "expense") continue;
      const c = (t.category && String(t.category)) || "Other";
      let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
      
      if (currencyService && targetCurrency) {
        if (t.originalCurrency !== undefined && t.originalAmount !== undefined) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          const base = typeof currencyService.getBaseCurrency === "function" ? currencyService.getBaseCurrency() : "IDR";
          amt = currencyService.convert(amt, base, targetCurrency);
        }
      }
      
      map[c] = (map[c] || 0) + amt;
    }
    return Object.entries(map)
      .map(([category, total]) => ({ 
        category, 
        total: typeof total === "number" && Number.isFinite(total) ? total : 0 
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }

  getTotalIncome(currencyService?: any, targetCurrency?: string): number {
    let total = 0;
    for (const t of this.cache) {
      if (t.type !== "income") continue;
      let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
      
      if (currencyService && targetCurrency) {
        if (t.originalCurrency !== undefined && t.originalAmount !== undefined) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          const base = typeof currencyService.getBaseCurrency === "function" ? currencyService.getBaseCurrency() : "IDR";
          amt = currencyService.convert(amt, base, targetCurrency);
        }
      }
      
      total += amt;
    }
    return total;
  }

  getTotalExpense(currencyService?: any, targetCurrency?: string): number {
    let total = 0;
    for (const t of this.cache) {
      if (t.type !== "expense") continue;
      let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
      
      if (currencyService && targetCurrency) {
        if (t.originalCurrency !== undefined && t.originalAmount !== undefined) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, targetCurrency);
        } else {
          const base = typeof currencyService.getBaseCurrency === "function" ? currencyService.getBaseCurrency() : "IDR";
          amt = currencyService.convert(amt, base, targetCurrency);
        }
      }
      
      total += amt;
    }
    return total;
  }
}
export { TransactionManager };