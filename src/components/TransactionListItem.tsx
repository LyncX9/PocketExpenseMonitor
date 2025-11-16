import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { Transaction } from "../types";

type Props = { item: Transaction; onDelete?: (id: string) => void };

const TransactionListItem: React.FC<Props> = ({ item, onDelete }) => {
  const navigation = useNavigation<any>();
  const { currencyService, settingsManager } = useServices();
  const [displayAmount, setDisplayAmount] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<string>("IDR");
  
  React.useEffect(() => {
    const load = async () => {
      const s = await settingsManager.getSettings();
      const currentCurrency = s?.currency ?? "IDR";
      setCurrency(currentCurrency);
      
      let amt = typeof item.amount === "number" && Number.isFinite(item.amount) ? item.amount : 0;
      if (item.originalCurrency && item.originalAmount !== undefined) {
        amt = currencyService.convert(item.originalAmount, item.originalCurrency, currentCurrency);
      } else {
        const base = currencyService.getBaseCurrency?.() || "IDR";
        amt = currencyService.convert(amt, base, currentCurrency);
      }
      
      setDisplayAmount(currencyService.formatDisplay(amt, currentCurrency));
    };
    void load();
  }, [item, currencyService, settingsManager]);
  
  const isIncome = item.type === "income";
  
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate("TransactionDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.category}>{item.category || "Other"}</Text>
          {item.title && <Text style={styles.title}>{item.title}</Text>}
          {item.note && <Text style={styles.note} numberOfLines={1}>{item.note}</Text>}
        </View>
        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? "+" : "-"} {displayAmount || "0"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  content: {
    flex: 1,
    marginRight: 12
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4
  },
  title: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  income: {
    color: "#10B981"
  },
  expense: {
    color: "#EF4444"
  }
});

export default TransactionListItem;
