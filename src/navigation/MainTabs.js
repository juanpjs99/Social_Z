import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

function HomeScreen({ setUser }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenido 👋</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

export default function MainTabs({ setUser }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio">
        {(props) => <HomeScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
