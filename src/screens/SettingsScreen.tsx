import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Text style={styles.subtext}>Currency settings are available in the Balance card on the Home screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#F8FBFF",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12
  },
  subtext: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20
  }
});

export default SettingsScreen;
