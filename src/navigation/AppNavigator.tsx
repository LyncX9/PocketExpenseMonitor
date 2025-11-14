import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import HomeScreen from "../screens/HomeScreen"
import AddTransactionScreen from "../screens/AddTransactionScreen"
import TransactionDetail from "../screens/TransactionDetail"
import SettingsScreen from "../screens/SettingsScreen"
import { RootStackParamList } from "./types"

const Stack = createStackNavigator<RootStackParamList>()

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetail} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator