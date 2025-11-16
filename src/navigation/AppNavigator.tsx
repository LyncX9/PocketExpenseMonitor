import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import HomeScreen from "../screens/HomeScreen"
import AddTransactionScreen from "../screens/AddTransactionScreen"
import TransactionDetail from "../screens/TransactionDetail"
import SettingsScreen from "../screens/SettingsScreen"
import { RootStackParamList } from "./types"

const Stack = createStackNavigator<RootStackParamList>()

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home" 
        screenOptions={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: "#3A86FF",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "700",
          }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Pocket Expense Monitor",
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate("AddTransaction")}
              >
                <Text style={styles.headerButtonText}>+ Add</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen 
          name="AddTransaction" 
          component={AddTransactionScreen}
          options={{
            title: "Add Transaction"
          }}
        />
        <Stack.Screen 
          name="TransactionDetail" 
          component={TransactionDetail}
          options={{
            title: "Transaction Details"
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: "Settings"
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  headerButton: {
    marginHorizontal: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default AppNavigator