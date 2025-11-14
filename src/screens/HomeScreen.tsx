import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { useServices } from "../contexts/ServiceContext";
import BalanceCard from "../components/BalanceCard";
import LineChartSimple from "../components/LineChartSimple";
import PieChartSimple from "../components/PieChartSimple";
import TransactionListItem from "../components/TransactionListItem";

const screenWidth = Dimensions.get("window").width;

const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { transactionManager, settingsManager, currencyService, notificationService } = useServices();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [alertActive, setAlertActive] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState("IDR");

  const loadData = () => {
    const inc = transactionManager.getTotalIncome();
    const exp = transactionManager.getTotalExpense();
    const bal = transactionManager.getBalance();
    const recent = transactionManager.getRecent(50);
    const weekly = transactionManager.getWeeklyTrend();
    const categories = transactionManager.getCategorySummary();

    setIncome(inc);
    setExpense(exp);
    setBalance(bal);
    setTransactions(recent);
    setWeeklyData(weekly);

    const mapped = categories.map((c: any, i: number) => ({
      category: c.category,
      total: c.total
    }));

    setPieData(mapped);

    const s = settingsManager.getSettings();
    setSettings(s);
    setDisplayCurrency(s.currency ?? "IDR");

    const threshold = s.alertThreshold ?? 0;
    const enabled = s.budgetAlertsEnabled ?? false;
    const active = enabled && exp >= threshold && threshold > 0;
    setAlertActive(active);

    if (active) {
      void notificationService.scheduleThresholdNotification("You have exceeded your alert threshold");
    }
  };

  useEffect(() => {
    loadData();
    const unsub = settingsManager.onChange(() => loadData());
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const displayedBalance = currencyService.formatDisplay(balance, displayCurrency);

  return (
    <ScrollView style={styles.container}>
      <BalanceCard
        balance={displayedBalance}
        income={currencyService.formatDisplay(income, displayCurrency)}
        expense={currencyService.formatDisplay(expense, displayCurrency)}
        currency={displayCurrency}
      />

      {alertActive && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>You have exceeded your alert threshold</Text>
        </View>
      )}

      <Text style={styles.section}>Weekly Trend</Text>
      <LineChartSimple data={weeklyData} width={screenWidth - 32} height={220} />

      <Text style={styles.section}>Expense by Category</Text>
      <PieChartSimple data={pieData} width={screenWidth - 32} height={220} />

      <Text style={styles.section}>Recent Transactions</Text>
      {transactions.map((tx: any) => (
        <TransactionListItem key={tx.id} item={tx} />
      ))}

      <View style={styles.actions}>
        <Pressable style={styles.fab} onPress={() => navigation.navigate("AddTransaction")}>
          <Text style={styles.fabText}>＋</Text>
        </Pressable>

        <Pressable style={styles.fabSecondary} onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.fabTextSmall}>⚙</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginTop: 16, fontSize: 18, fontWeight: "600" },
  alert: {
    backgroundColor: "#ffcccc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8
  },
  alertText: { color: "#b30000", fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 30
  },
  fab: {
    backgroundColor: "#3A86FF",
    padding: 16,
    borderRadius: 40,
    marginRight: 12
  },
  fabSecondary: {
    backgroundColor: "#999",
    padding: 14,
    borderRadius: 40
  },
  fabText: { fontSize: 24, color: "#fff" },
  fabTextSmall: { fontSize: 18, color: "#fff" }
});

export default HomeScreen;
