import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useServices } from "../contexts/ServiceContext";

type Props = {
  balance: number; 
  income: string;
  expense: string;
  currency: string;
  onCurrencyChange?: () => void;
};

const currencyOptions = ["IDR", "USD", "EUR", "JPY", "GBP"];

const BalanceCard: React.FC<Props> = ({ balance, income, expense, currency, onCurrencyChange }) => {
  const { settingsManager, currencyService } = useServices();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(currency);
  const [exchangeRate, setExchangeRate] = useState<string>("");

  useEffect(() => {
    setCurrentCurrency(currency);
    loadExchangeRate();
  }, [currency]);

  const loadExchangeRate = async () => {
    try {
      const base = currencyService.getBaseCurrency();
      if (base !== currency) {
        const rate = await currencyService.fetchRate(base, currency);
        setExchangeRate(`1 ${base} = ${rate.toFixed(4)} ${currency}`);
      } else {
        setExchangeRate("");
      }
    } catch {
      setExchangeRate("");
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) {
      setShowCurrencyModal(false);
      return;
    }

    await currencyService.loadRates(newCurrency);
    await settingsManager.update({ currency: newCurrency });
    setCurrentCurrency(newCurrency);
    setShowCurrencyModal(false);
    if (onCurrencyChange) {
      onCurrencyChange();
    }
  };

  const safeBalance = typeof balance === "number" && Number.isFinite(balance) && !Number.isNaN(balance) ? balance : 0;
  
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Balance</Text>
        <Pressable onPress={() => setShowCurrencyModal(true)} style={styles.currencyButton}>
          <Text style={styles.currencyText}>{currentCurrency} ▼</Text>
        </Pressable>
      </View>
      
      {exchangeRate ? (
        <Text style={styles.rateText}>{exchangeRate}</Text>
      ) : null}
      
      <Text style={styles.balance}>
        {currentCurrency} {safeBalance.toLocaleString()}
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

      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            {currencyOptions.map((c) => (
              <Pressable
                key={c}
                style={[styles.modalOption, currentCurrency === c && styles.modalOptionActive]}
                onPress={() => handleCurrencyChange(c)}
              >
                <Text style={[styles.modalOptionText, currentCurrency === c && styles.modalOptionTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 24
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  balance: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
    letterSpacing: -0.5
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6"
  },
  col: {
    flex: 1
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    fontWeight: "500",
    letterSpacing: 0.3
  },
  income: {
    color: "#10B981",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  expense: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A86FF"
  },
  rateText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 300
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
    textAlign: "center"
  },
  modalOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F3F4F6"
  },
  modalOptionActive: {
    backgroundColor: "#3A86FF"
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center"
  },
  modalOptionTextActive: {
    color: "#FFFFFF"
  },
  modalCancel: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6"
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center"
  }
});

export default BalanceCard;
