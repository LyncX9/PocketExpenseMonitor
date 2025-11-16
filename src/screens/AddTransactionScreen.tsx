import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";

const CATEGORIES = ["General", "Food", "Transport", "Shopping", "Salary", "Bills", "Entertainment", "Other"];

const cleanNumber = (v: any): number => {
  if (typeof v === "number") return isFinite(v) ? v : NaN;
  if (typeof v === "string") {
    const s = v.replace(/[^\d.-]/g, "");
    if (s === "" || s === "-" || s === "." || s === "-.") return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

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
    let mounted = true;
    (async () => {
      try {
        const s = await settingsManager.getSettings();
        if (!mounted) return;
        setCurrencySymbol(s?.currency ?? "IDR");
      } catch {
        if (!mounted) return;
        setCurrencySymbol("IDR");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [settingsManager]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeAmount = (v: string) => {
    const cleaned = v.replace(/[^0-9]/g, "");
    if (cleaned !== amountInput) {
      setAmountInput(cleaned);
    }
  };

  const getDisplayAmount = (): string => {
    if (!amountInput || amountInput === "0") return "";
    return amountInput.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required";
    const num = Number(amountInput);
    if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
    if (!category) return "Category required";
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      return;
    }
    const num = Number(amountInput);
    if (isNaN(num) || num <= 0) {
      return;
    }
    const payload = {
      title: title.trim(),
      amount: num,
      category,
      type,
      date: date.toISOString(),
      note: ""
    };
    const addFn = (transactionManager as any).addTransaction ?? (transactionManager as any).add ?? null;
    if (typeof addFn === "function") {
      await addFn.call(transactionManager, payload, currencySymbol, num);
      navigation.goBack();
      return;
    }
    console.warn("transactionManager has no addTransaction/add method");
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
      <View style={styles.amountContainer}>
        <TextInput 
          value={getDisplayAmount()} 
          onChangeText={onChangeAmount} 
          style={styles.input} 
          keyboardType="numeric" 
          placeholder="0"
          returnKeyType="done"
        />
        {amountInput && Number(amountInput) > 0 && (
          <Text style={styles.amountHint}>
            {currencyService.formatDisplay(Number(amountInput), currencySymbol)}
          </Text>
        )}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerWrap}>
        <Picker 
          selectedValue={category} 
          onValueChange={(v) => {
            if (v) setCategory(String(v));
          }}
          style={styles.picker}
        >
          {CATEGORIES.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
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
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#F8FBFF" 
  },
  label: { 
    fontSize: 14, 
    marginTop: 20, 
    marginBottom: 8, 
    fontWeight: "600",
    color: "#374151",
    letterSpacing: 0.3
  },
  input: { 
    backgroundColor: "#FFFFFF", 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#1F2937",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  segment: { 
    flexDirection: "row", 
    borderRadius: 12, 
    overflow: "hidden", 
    marginBottom: 16, 
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  segmentButton: { 
    flex: 1, 
    padding: 16, 
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: { 
    backgroundColor: "#3A86FF" 
  },
  segmentText: { 
    color: "#6B7280", 
    fontWeight: "600",
    fontSize: 15
  },
  segmentTextActive: { 
    color: "#FFFFFF",
    fontWeight: "700"
  },
  pickerWrap: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: "hidden"
  },
  picker: {
    height: 50
  },
  amountContainer: {
    position: "relative"
  },
  amountHint: {
    position: "absolute",
    right: 16,
    top: 16,
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500"
  },
  saveButton: { 
    marginTop: 32, 
    backgroundColor: "#3A86FF", 
    padding: 18, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center",
    elevation: 4,
    shadowColor: "#3A86FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  saveText: { 
    color: "#FFFFFF", 
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5
  }
});

export default AddTransactionScreen;
