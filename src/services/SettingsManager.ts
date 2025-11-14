import StorageService from "./StorageService";
import { AppSettings } from "../types";

export class SettingsManager {
  private storage: StorageService;
  private cache: AppSettings = {
    currency: "IDR",
    monthlyBudget: 0,
    alertThreshold: 0,
    budgetAlertsEnabled: false,
    categoryBudgets: {}
  };

  private listeners: Array<(s: AppSettings) => void> = [];

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async load(): Promise<AppSettings> {
    const raw = await this.storage.loadSettings();
    if (raw) this.cache = raw;
    return this.cache;
  }

  getSettings(): AppSettings {
    return this.cache;
  }

  async saveSettings(s: AppSettings): Promise<void> {
    this.cache = s;
    await this.storage.saveSettings(s);
    this.notify();
  }

  async update(partial: Partial<AppSettings>): Promise<void> {
    this.cache = { ...this.cache, ...partial };
    await this.storage.saveSettings(this.cache);
    this.notify();
  }

  onChange(fn: (s: AppSettings) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) fn(this.cache);
  }
}
