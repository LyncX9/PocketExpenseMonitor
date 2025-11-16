import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { Transaction } from "../types";

const TransactionDetail: React.FC = () => {
  const route = useRoute();
  const nav = useNavigation();
  const { transactionManager, currencyService, settingsManager } = useServices();
  const { id } = (route.params || {}) as { id?: string };
  const [tx, setTx] = useState<Transaction | null>(null);
  const [currency, setCurrency] = useState<string>("IDR");

  useEffect(() => {
    const load = async () => {
      await transactionManager.load();
      const all = transactionManager.getAll();
      const found = all.find(t => t.id === id) ?? null;
      setTx(found);
      const s = await settingsManager.getSettings();
      setCurrency(s?.currency ?? "IDR");
    };
    void load();
  }, [id]);

  const remove = async () => {
    if (!id) return;
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ok = await transactionManager.deleteTransaction(id);
            if (ok) (nav as any).goBack();
            else Alert.alert("Error", "Failed to delete transaction");
          }
        }
      ]
    );
  };

  if (!tx) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Transaction not found</Text>
      </View>
    );
  }

  let safeAmount = typeof tx.amount === "number" && Number.isFinite(tx.amount) && !Number.isNaN(tx.amount) ? tx.amount : 0;
  
  if (tx.originalCurrency && tx.originalAmount !== undefined) {
    safeAmount = currencyService.convert(tx.originalAmount, tx.originalCurrency, currency);
  } else {
    const base = currencyService.getBaseCurrency?.() || "IDR";
    safeAmount = currencyService.convert(safeAmount, base, currency);
  }
  
  const formattedAmount = currencyService.formatDisplay(safeAmount, currency);
  const isIncome = tx.type === "income";

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.category}>{tx.category || "Other"}</Text>
          <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
            {isIncome ? "+" : "-"} {formattedAmount}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <Text style={styles.value}>{tx.title || "No title"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={[styles.typeBadge, isIncome ? styles.typeIncome : styles.typeExpense]}>
            <Text style={[styles.typeText, isIncome ? styles.typeTextIncome : styles.typeTextExpense]}>
              {tx.type === "income" ? "Income" : "Expense"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(tx.date).toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}</Text>
        </View>

        {tx.note && (
          <View style={styles.section}>
            <Text style={styles.label}>Note</Text>
            <Text style={styles.value}>{tx.note}</Text>
          </View>
        )}

        <Pressable style={styles.deleteButton} onPress={remove}>
          <Text style={styles.deleteText}>Delete Transaction</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F8FBFF"
  },
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  notFound: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 40
  },
  header: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  category: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5
  },
  income: {
    color: "#10B981"
  },
  expense: {
    color: "#EF4444"
  },
  section: {
    marginBottom: 24
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  value: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500"
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  typeIncome: {
    backgroundColor: "#D1FAE5"
  },
  typeExpense: {
    backgroundColor: "#FEE2E2"
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600"
  },
  typeTextIncome: {
    color: "#065F46"
  },
  typeTextExpense: {
    color: "#991B1B"
  },
  deleteButton: {
    marginTop: 32,
    backgroundColor: "#EF4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5
  }
});

export default TransactionDetail;
