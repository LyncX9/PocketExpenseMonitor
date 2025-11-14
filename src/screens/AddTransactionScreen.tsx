import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";

const CATEGORIES = ["General", "Food", "Transport", "Shopping", "Salary", "Bills", "Entertainment", "Other"];

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { transactionManager, settingsManager, currencyService } = useServices();
  const [title, setTitle] = useState<string>("");
  const [amountInput, setAmountInput] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>("IDR");

  useEffect(() => {
    const s = settingsManager.getSettings();
    setCurrencySymbol(s.currency ?? "IDR");
  }, [settingsManager]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
  setShowPicker(false);
  if (selectedDate) setDate(selectedDate);
};


  const onChangeAmount = (v: string) => {
    const formatted = currencyService.formatInput(v, currencySymbol);
    setAmountInput(formatted);
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required";
    const num = currencyService.parseAmount(amountInput);
    if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
    if (!category) return "Category required";
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      return;
    }
    const num = currencyService.parseAmount(amountInput);
    const payload = {
      title: title.trim(),
      amount: num,
      category,
      type,
      date: date.toISOString(),
      note: ""
    };
    await transactionManager.addTransaction(payload as any);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.segment}>
        <Pressable style={[styles.segmentButton, type === "expense" ? styles.segmentActive : null]} onPress={() => setType("expense")}>
          <Text style={[styles.segmentText, type === "expense" ? styles.segmentTextActive : null]}>Expense</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, type === "income" ? styles.segmentActive : null]} onPress={() => setType("income")}>
          <Text style={[styles.segmentText, type === "income" ? styles.segmentTextActive : null]}>Income</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="e.g. Lunch, Salary" />

      <Text style={styles.label}>Amount ({currencySymbol})</Text>
      <TextInput value={amountInput} onChangeText={onChangeAmount} style={styles.input} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={(v) => setCategory(String(v))}>
          {CATEGORIES.map((c) => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Date</Text>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Text>{date.toDateString()}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeDate} />
      )}

      <Pressable style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fb" },
  label: { fontSize: 14, marginTop: 12, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e6e9ef" },
  segment: { flexDirection: "row", borderRadius: 8, overflow: "hidden", marginBottom: 12, backgroundColor: "#fff" },
  segmentButton: { flex: 1, padding: 12, alignItems: "center" },
  segmentActive: { backgroundColor: "#2F80ED" },
  segmentText: { color: "#333", fontWeight: "600" },
  segmentTextActive: { color: "#fff" },
  pickerWrap: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#e6e9ef" },
  saveButton: { marginTop: 20, backgroundColor: "#2F80ED", padding: 14, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700" }
});

export default AddTransactionScreen;
