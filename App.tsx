import "react-native-get-random-values";
import React from "react";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { ServicesProvider } from "./src/contexts/ServiceContext";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3A86FF",
    accent: "#FFBE0B",
    background: "#F8FBFF",
    surface: "#FFFFFF",
    text: "#1A1A1A",
    error: "#DC3545",
    success: "#28A745"
  }
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <ServicesProvider>
        <AppNavigator />
      </ServicesProvider>
    </PaperProvider>
  );
};

export default App;
