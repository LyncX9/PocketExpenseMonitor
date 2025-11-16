import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import BalanceCard from "../components/BalanceCard";
import LineChartSimple from "../components/LineChartSimple";
import PieChartSimple from "../components/PieChartSimple";
import TransactionListItem from "../components/TransactionListItem";

const screenWidth = Dimensions.get("window").width;

const sanitizeNumber = (v: any): number => {
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
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    const commaCount = (s.match(/,/g) || []).length;
    if (commaCount === 1 && s.split(",")[1]?.length <= 2) {
      s = s.replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasDot && !hasComma) {
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount > 1 || (dotCount === 1 && s.split(".")[1]?.length > 2)) {
      s = s.replace(/\./g, "");
    }
  }
  s = s.replace(/[^\d.-]/g, "");
  if (s === "" || s === "-" || s === "." || s === "-.") return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
  return n;
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { transactionManager, settingsManager, currencyService } = useServices();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<number[]>([]);
  const nowInit = new Date();
  const currentMonthKey = `${nowInit.getFullYear()}-${String(nowInit.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [showDelta] = useState<boolean>(true);
  const [dayLabels, setDayLabels] = useState<string[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState("IDR");

  const loadData = async () => {
    await transactionManager.load();
    
    try {
      const s = await settingsManager.getSettings();
      const currentCurrency = s?.currency ?? "IDR";
      setDisplayCurrency(currentCurrency);
      const savedMonth = s?.selectedMonth ?? selectedMonth;
      if (savedMonth !== selectedMonth) setSelectedMonth(savedMonth);
      
      const inc = transactionManager.getTotalIncome(currencyService, currentCurrency);
      const exp = transactionManager.getTotalExpense(currencyService, currentCurrency);
      const bal = inc - exp;
      const recent = transactionManager.getRecent(50);
      const weeklyTrend = transactionManager.getWeeklyTrend(currencyService, currentCurrency);
      const categories = transactionManager.getCategorySummary(currencyService, currentCurrency);

      setIncome(inc);
      setExpense(exp);
      setBalance(bal);
      setTransactions(recent);

      const now = new Date();
      const monthlyValues: number[] = [];
      const allTransactions = transactionManager.getAll().sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      let cumulativeBalance = 0;
      const balanceByDate: Record<string, number> = {};
      
      for (const t of allTransactions) {
        const txDate = new Date(t.date).toISOString().slice(0, 10);
        let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
        
        if (t.originalCurrency && t.originalAmount !== undefined) {
          amt = currencyService.convert(t.originalAmount, t.originalCurrency, currentCurrency);
        } else {
          const base = currencyService.getBaseCurrency?.() || "IDR";
          amt = currencyService.convert(amt, base, currentCurrency);
        }
        
        if (t.type === "income") {
          cumulativeBalance += amt;
        } else {
          cumulativeBalance -= amt;
        }
        
        balanceByDate[txDate] = cumulativeBalance;
      }
      const monthKey = (s && s.selectedMonth) ? s.selectedMonth : selectedMonth;
      const [sy, sm] = (monthKey || currentMonthKey).split("-");
      const year = Number(sy) || now.getFullYear();
      const month = Number(sm) - 1;
      const lastOfMonth = new Date(year, month + 1, 0).getDate();
      const labels: string[] = [];
      for (let day = 1; day <= lastOfMonth; day++) {
        const d = new Date(year, month, day);
        const dateStr = d.toISOString().slice(0, 10);
        labels.push(String(day));

        const dates = Object.keys(balanceByDate).sort();
        const latestBalanceBeforeDate = dates
          .filter(dd => dd <= dateStr)
          .map(dd => balanceByDate[dd])
          .pop() || 0;

        monthlyValues.push(sanitizeNumber(latestBalanceBeforeDate));
      }
      setDayLabels(labels);

      if (true && monthlyValues.length > 0) {
        const deltaValues: number[] = [];
        for (let i = 0; i < monthlyValues.length; i++) {
          const prev = i === 0 ? 0 : monthlyValues[i - 1];
          const curr = monthlyValues[i];
          deltaValues.push(sanitizeNumber(curr - prev));
        }
        setWeekly(deltaValues);
      } else {
        setWeekly(monthlyValues);
      }

      const mk = monthKey || currentMonthKey;
      const [yy, mm] = mk.split("-");
      const fy = Number(yy) || now.getFullYear();
      const fm = Number(mm) - 1;
      const lastDayOf = new Date(fy, fm + 1, 0).getDate();
      const startDateStr = new Date(fy, fm, 1).toISOString().slice(0, 10);
      const endDateStr = new Date(fy, fm, lastDayOf).toISOString().slice(0, 10);

      const filteredTx = transactionManager.getAll().filter((t: any) => {
        const d = new Date(t.date).toISOString().slice(0, 10);
        return d >= startDateStr && d <= endDateStr;
      });

      const catMap: Record<string, number> = {};
      for (const t of filteredTx) {
        if (t.type !== "expense") continue;
        const c = (t.category && String(t.category)) || "Other";
        let amt = typeof t.amount === "number" && Number.isFinite(t.amount) ? t.amount : 0;
        if (currencyService && currentCurrency) {
          if (t.originalCurrency !== undefined && t.originalAmount !== undefined) {
            amt = currencyService.convert(t.originalAmount, t.originalCurrency, currentCurrency);
          } else {
            const base = typeof currencyService.getBaseCurrency === "function" ? currencyService.getBaseCurrency() : "IDR";
            amt = currencyService.convert(amt, base, currentCurrency);
          }
        }
        catMap[c] = (catMap[c] || 0) + amt;
      }

      const mappedFilteredCategories = Object.entries(catMap)
        .map(([category, total]) => ({ category, total: sanitizeNumber(total) }))
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total);
      setPieData(mappedFilteredCategories);
    } catch {
      setDisplayCurrency("IDR");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = settingsManager.onChange((_) => {
      loadData();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedMonth, showDelta]);

  useEffect(() => {
    settingsManager.update({ selectedMonth, showDelta });
  }, [selectedMonth, showDelta]);


  return (
    <ScrollView style={styles.container}>
      <BalanceCard
        balance={balance}
        income={currencyService.formatDisplay(income, displayCurrency)}
        expense={currencyService.formatDisplay(expense, displayCurrency)}
        currency={displayCurrency}
        onCurrencyChange={loadData}
      />

      <Text style={styles.section}>Monthly Trend</Text>
      <View style={[styles.weekSelector, { alignItems: "center" }]}>
        <Pressable onPress={() => {
          const [yy, mm] = selectedMonth.split("-");
          const y = Number(yy) || nowInit.getFullYear();
          const m = Number(mm) - 1;
          const prev = new Date(y, m - 1, 1);
          const key = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
          setSelectedMonth(key);
        }} style={[styles.weekButton, { flex: 0.4 }]}>
          <Text style={styles.weekText}>Prev</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>{new Date(Number(selectedMonth.split("-")[0]), Number(selectedMonth.split("-")[1]) - 1).toLocaleString(undefined, { month: "long", year: "numeric" })}</Text>
        </View>
        <Pressable onPress={() => {
          const [yy, mm] = selectedMonth.split("-");
          const y = Number(yy) || nowInit.getFullYear();
          const m = Number(mm) - 1;
          const next = new Date(y, m + 1, 1);
          const key = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
          setSelectedMonth(key);
        }} style={[styles.weekButton, { flex: 0.4, marginRight: 0 }]}>
          <Text style={styles.weekText}>Next</Text>
        </Pressable>
      </View>
      <View style={[styles.deltaToggle, styles.deltaToggleActive]}>
        <Text style={[styles.deltaToggleText, styles.deltaToggleTextActive]}>Showing: Daily Change</Text>
      </View>
      <LineChartSimple data={weekly} dayLabels={dayLabels} width={screenWidth - 32} height={220} />
      <Text style={styles.chartHint}>Tap data points to interact with the chart</Text>

      <Text style={styles.section}>Expense by Category</Text>
      <PieChartSimple data={pieData} width={screenWidth - 32} height={220} />

      <Text style={styles.section}>Recent Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Tap "+ Add" in the header to add your first transaction</Text>
        </View>
      ) : (
        transactions.map((tx: any) => (
          <TransactionListItem key={tx.id} item={tx} />
        ))
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#F8FBFF" 
  },
  section: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginTop: 24, 
    marginBottom: 16,
    color: "#1F2937",
    letterSpacing: 0.3
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center"
  },
  weekSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  weekButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  weekButtonActive: {
    backgroundColor: "#3A86FF"
  },
  weekText: {
    color: "#374151",
    fontWeight: "600"
  },
  weekTextActive: {
    color: "#FFFFFF"
  },
  deltaToggle: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12
  },
  deltaToggleActive: {
    backgroundColor: "#3A86FF"
  },
  deltaToggleText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14
  },
  deltaToggleTextActive: {
    color: "#FFFFFF"
  },
  chartHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    fontStyle: "italic"
  }
});

export default HomeScreen;
