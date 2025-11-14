import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction, AppSettings } from "../types";
const TX_KEY = "APP_TRANSACTIONS";
const SETTINGS_KEY = "APP_SETTINGS";
export default class StorageService {
  async loadTransactions(): Promise<Transaction[]> {
    const raw = await AsyncStorage.getItem(TX_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Transaction[];
    } catch {
      return [];
    }
  }
  async saveTransactions(txs: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(TX_KEY, JSON.stringify(txs));
  }
  async loadSettings(): Promise<AppSettings | null> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AppSettings;
    } catch {
      return null;
    }
  }
  async saveSettings(s: AppSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }
}
