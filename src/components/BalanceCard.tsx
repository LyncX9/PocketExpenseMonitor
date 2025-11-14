import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  balance: number; 
  income: string;
  expense: string;
  currency: string;
};

const BalanceCard: React.FC<Props> = ({ balance, income, expense, currency }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Balance</Text>
      <Text style={styles.balance}>
        {currency} {balance.toLocaleString()}
      </Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.income}>{income}</Text>
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Expense</Text>
          <Text style={styles.expense}>{expense}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 20
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  balance: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  col: {
    flex: 1
  },
  label: {
    fontSize: 14,
    opacity: 0.7
  },
  income: {
    color: "#28A745",
    fontSize: 18,
    fontWeight: "600"
  },
  expense: {
    color: "#E63946",
    fontSize: 18,
    fontWeight: "600"
  }
});

export default BalanceCard;
