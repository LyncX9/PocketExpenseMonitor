import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, Button, Switch } from "react-native";
import { useServices } from "../contexts/ServiceContext";

const currencyOptions = ["IDR", "USD", "EUR", "JPY", "GBP"];

const SettingsScreen: React.FC = () => {
  const { settingsManager } = useServices();

  const [currency, setCurrency] = useState("IDR");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const s = await settingsManager.load();
      setCurrency(s.currency);
      setMonthlyBudget(String(s.monthlyBudget));
      setAlertThreshold(String(s.alertThreshold));
      setAlertsEnabled(s.budgetAlertsEnabled);
      const mapped: Record<string, string> = {};
      Object.keys(s.categoryBudgets).forEach((c) => {
        mapped[c] = String(s.categoryBudgets[c]);
      });
      setCategoryBudgets(mapped);
    };
    load();
  }, [settingsManager]);

  const onSave = async () => {
    const parsedBudgets: Record<string, number> = {};
    Object.keys(categoryBudgets).forEach((c) => {
      const v = Number(categoryBudgets[c]);
      parsedBudgets[c] = isNaN(v) ? 0 : v;
    });

    await settingsManager.update({
      currency,
      monthlyBudget: Number(monthlyBudget) || 0,
      alertThreshold: Number(alertThreshold) || 0,
      budgetAlertsEnabled: alertsEnabled,
      categoryBudgets: parsedBudgets
    });
  };

  const updateCategoryBudget = (category: string, value: string) => {
    setCategoryBudgets({ ...categoryBudgets, [category]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Currency</Text>

      <View style={styles.segment}>
        {currencyOptions.map((c) => (
          <Text
            key={c}
            style={[styles.segmentItem, currency === c && styles.segmentItemActive]}
            onPress={() => setCurrency(c)}
          >
            {c}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>Monthly Budget</Text>
      <TextInput
        value={monthlyBudget}
        onChangeText={setMonthlyBudget}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Alert Threshold</Text>
      <TextInput
        value={alertThreshold}
        onChangeText={setAlertThreshold}
        style={styles.input}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <Text style={styles.label}>Enable Alerts</Text>
        <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} />
      </View>

      <Text style={styles.title}>Category Budgets</Text>
      {Object.keys(categoryBudgets).map((cat) => (
        <View key={cat}>
          <Text style={styles.label}>{cat}</Text>
          <TextInput
            value={categoryBudgets[cat]}
            onChangeText={(v) => updateCategoryBudget(cat, v)}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      ))}

      <Button title="Save" onPress={onSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  label: { fontSize: 16, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10
  },
  segmentItem: {
    flex: 1,
    textAlign: "center",
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ddd"
  },
  segmentItemActive: {
    backgroundColor: "#4A90E2",
    color: "white",
    fontWeight: "bold"
  }
});

export default SettingsScreen;
