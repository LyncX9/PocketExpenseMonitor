import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
const LAST_KEY = "LAST_THRESHOLD_NOTIFICATION";
export default class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }
  async canNotifyToday(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(LAST_KEY);
    if (!raw) return true;
    const ts = Number(raw);
    return new Date(ts).toDateString() !== new Date().toDateString();
  }
  async markNotifiedNow(): Promise<void> {
    await AsyncStorage.setItem(LAST_KEY, String(Date.now()));
  }
  async scheduleThresholdNotification(body: string): Promise<void> {
    const ok = await this.requestPermissions();
    if (!ok) return;
    const can = await this.canNotifyToday();
    if (!can) return;
    await Notifications.scheduleNotificationAsync({ content: { title: "Budget Alert", body }, trigger: null });
    await this.markNotifiedNow();
  }
}
