import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceContext";
import { Transaction } from "../types";

const TransactionDetail: React.FC = () => {
  const route = useRoute();
  const nav = useNavigation();
  const { transactionManager } = useServices();
  const { id } = (route.params || {}) as { id?: string };
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const all = transactionManager.getAll();
    const found = all.find(t => t.id === id) ?? null;
    setTx(found);
  }, [id]);

  const remove = async () => {
    if (!id) return;
    const ok = await transactionManager.deleteTransaction(id);
    if (ok) (nav as any).goBack();
    else Alert.alert("Delete failed");
  };

  if (!tx) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tx.title ?? tx.category}</Text>
      <Text>Amount: {tx.amount}</Text>
      <Text>Type: {tx.type}</Text>
      <Text>Date: {new Date(tx.date).toLocaleString()}</Text>
      <Text>Note: {tx.note ?? "-"}</Text>
      <View style={{ marginTop: 12 }}>
        <Button mode="contained" onPress={remove} style={{ backgroundColor: "#DC3545" }}>Delete</Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", margin: 12, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
});

export default TransactionDetail;
