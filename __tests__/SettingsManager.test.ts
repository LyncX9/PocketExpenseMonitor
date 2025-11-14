import { StorageService } from "../src/services/StorageService";
import { SettingsManager } from "../src/services/SettingsManager";
jest.mock("../src/services/StorageService");
const MockedStorage = StorageService as jest.MockedClass<typeof StorageService>;
describe("SettingsManager", () => {
  let storage: StorageService;
  let manager: SettingsManager;
  beforeEach(() => {
    storage = new MockedStorage();
    (storage.loadSettings as jest.Mock).mockResolvedValue(null);
    manager = new SettingsManager(storage);
  });
  test("update and load settings", async () => {
    const s = { currency: "EUR", monthlyBudget: 2000, alertThreshold: 300, budgetAlertsEnabled: false };
    await manager.saveSettings(s);
    expect(manager.getSettings().currency).toBe("EUR");
    (storage.loadSettings as jest.Mock).mockResolvedValue(s);
    const loaded = await manager.loadSettings();
    expect(loaded.currency).toBe("EUR");
  });
});
