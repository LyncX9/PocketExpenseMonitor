import React from "react";
import { View, Text, StyleSheet } from "react-native";
type Props = {
  balance: string;
  income: string;
  expense: string;
  currency?: string;
};
const BalanceCard: React.FC<Props> = ({ balance, income, expense }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.balanceLabel}>{`Balance`}</Text>
      <Text style={styles.balanceValue}>{balance}</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.smallLabel}>Income</Text>
          <Text style={styles.smallValue}>{income}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.smallLabel}>Expense</Text>
          <Text style={styles.smallValue}>{expense}</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, marginBottom: 12 },
  balanceLabel: { fontSize: 14, color: "#6B7280", marginBottom: 6 },
  balanceValue: { fontSize: 18, fontWeight: "700", color: "#111827" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  col: { flex: 1 },
  smallLabel: { fontSize: 12, color: "#6B7280" },
  smallValue: { fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 4 }
});
export default BalanceCard;
