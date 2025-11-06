import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native";

// Import screens (ajustado a tu estructura)
import HomeScreen from "../screens/Main/HomeScreen";
import FollowersScreen from "../screens/Main/FollowersScreen";
import FollowingScreen from "../screens/Main/FollowingsScreen";
import ProfileScreen from "../screens/Main/ProfileScreen";
import CreateTweetScreen from "../screens/Main/CreateTweetScreen"; // solo si lo usas dentro del stack

const Tab = createBottomTabNavigator();

export default function MainTabs({ setUser }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#1DA1F2",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => {
          let icon = "ellipse-outline";
          if (route.name === "Inicio") icon = "home-outline";
          if (route.name === "Seguidores") icon = "people-outline";
          if (route.name === "Seguidos") icon = "person-add-outline";
          if (route.name === "Perfil") icon = "person-circle-outline";
          return <Ionicons name={icon} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Seguidores" component={FollowersScreen} />
      <Tab.Screen name="Seguidos" component={FollowingScreen} />
      <Tab.Screen
        name="Perfil"
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
              <Ionicons name="log-out-outline" size={22} color="#1DA1F2" />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
