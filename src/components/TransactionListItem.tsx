import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Transaction } from "../types";

type Props = { item: Transaction; onDelete?: (id: string) => void };

const TransactionListItem: React.FC<Props> = ({ item, onDelete }) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate("TransactionDetail", { id: item.id })}>
      <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#EEE" }}>
        <Text style={{ fontSize: 16 }}>{item.category}</Text>
        <Text>{item.note ?? ""}</Text>
        <Text style={{ position: "absolute", right: 12, top: 16 }}>{item.amount}</Text>
        {onDelete && <Text onPress={() => onDelete(item.id)}>Delete</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default TransactionListItem;
