import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";

// Import screens (ajustado a tu estructura)
import HomeScreen from "../screens/Main/HomeScreen";
import FollowersScreen from "../screens/Main/FollowersScreen";
import FollowingScreen from "../screens/Main/FollowingsScreen";
import ProfileScreen from "../screens/Main/ProfileScreen";
import EditProfileScreen from "../screens/Main/EditProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Profile Stack to include edit screen
function ProfileStack({ setUser }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs({ setUser }) {
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
          headerShown: false,
        }}
      >
        {(props) => <ProfileStack {...props} setUser={setUser} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
