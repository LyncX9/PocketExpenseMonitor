import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions
} from "react-native";
import { useServices } from "../contexts/ServiceContext";
import BalanceCard from "../components/BalanceCard";
import LineChartSimple from "../components/LineChartSimple";
import PieChartSimple from "../components/PieChartSimple";
import TransactionListItem from "../components/TransactionListItem";

const screenWidth = Dimensions.get("window").width;

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactionManager, settingsManager, currencyService } = useServices();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState("IDR");

  const loadData = () => {
    const inc = transactionManager.getTotalIncome();
    const exp = transactionManager.getTotalExpense();
    const bal = transactionManager.getBalance();
    const recent = transactionManager.getRecent(50);
    const weeklyTrend = transactionManager.getWeeklyTrend();
    const categories = transactionManager.getCategorySummary();

    setIncome(inc);
    setExpense(exp);
    setBalance(bal);
    setTransactions(recent);
    setWeekly(weeklyTrend);

    const mapped = categories.map((c: any) => ({
      category: c.category,
      total: Number(c.total) || 0
    }));

    setPieData(mapped);

    const s = settingsManager.getSettings();
    setDisplayCurrency(s.currency ?? "IDR");
  };

  useEffect(() => {
    loadData();

    const unsubscribe = settingsManager.onChange((_) => {
      loadData();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <BalanceCard
        balance={balance}
        income={currencyService.formatDisplay(income, displayCurrency)}
        expense={currencyService.formatDisplay(expense, displayCurrency)}
        currency={displayCurrency}
      />

      <Text style={styles.section}>Weekly Trend</Text>
      <LineChartSimple data={weekly} width={screenWidth - 32} height={220} />

      <Text style={styles.section}>Expense by Category</Text>
      <PieChartSimple data={pieData} width={screenWidth - 32} height={220} />

      <Text style={styles.section}>Recent Transactions</Text>
      {transactions.map((tx: any) => (
        <TransactionListItem key={tx.id} item={tx} />
      ))}

      <View style={styles.actions}>
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("AddTransaction")}
        >
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { fontSize: 18, fontWeight: "bold", marginVertical: 12 },
  actions: { position: "absolute", bottom: 20, right: 20 },
  fab: {
    backgroundColor: "#3A86FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  fabText: { fontSize: 32, lineHeight: 32, color: "white" }
});

export default HomeScreen;
