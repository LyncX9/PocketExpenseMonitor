import { StorageService } from "../src/services/StorageService";
import { TransactionManager } from "../src/services/TransactionManager";
jest.mock("../src/services/StorageService");
const MockedStorage = StorageService as jest.MockedClass<typeof StorageService>;
describe("TransactionManager", () => {
  let storage: StorageService;
  let manager: TransactionManager;
  beforeEach(() => {
    storage = new MockedStorage();
    (storage.loadTransactions as jest.Mock).mockResolvedValue([]);
    manager = new TransactionManager(storage);
  });
  test("add, delete and total expense", async () => {
    await manager.load();
    const t = await manager.addTransaction({ title: "Lunch", amount: 10, date: new Date().toISOString(), category: "Food", type: "expense" });
    expect(t.id).toBeDefined();
    const totalExpense = manager.getTotalExpense();
    expect(totalExpense).toBe(10);
    const deleted = await manager.deleteTransaction(t.id);
    expect(deleted).toBe(true);
    expect(manager.getTotalExpense()).toBe(0);
  });
});
