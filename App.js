import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";

import RegisterScreen from "./src/screens/Auth/RegisterScreen";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import MainTabs from "./src/navigation/MainTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: "#ffffff55" },
            headerTintColor: "#8E1F7F",
            contentStyle: { backgroundColor: "#ffffff55" },
          }}
        >
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Registro" }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Iniciar Sesión" }}
          />
          {/* 👇 Aquí el stack apunta al navegador principal */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
