import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens (ajustado a tu estructura)
import HomeScreen from "../screens/Main/HomeScreen";
import CreateTweetScreen from "../screens/Main/CreateTweetScreen";
import CommentsScreen from "../screens/Main/CommentsScreen";
import FollowersScreen from "../screens/Main/FollowersScreen";
import FollowingScreen from "../screens/Main/FollowingsScreen";
import ProfileScreen from "../screens/Main/ProfileScreen";
import EditProfileScreen from "../screens/Main/EditProfileScreen";
import UserProfileScreen from "../screens/Main/UserProfileScreen";

//import de imagenes de navegador
import { Image } from "react-native";

import homeIcon from "../assets/home.png";
import followersIcon from "../assets/followers.png";
import followingIcon from "../assets/following.png";
import profileIcon from "../assets/profile.png";



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
      <Stack.Screen
        name="Followers"
        component={FollowersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Following"
        component={FollowingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs({ setUser }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#8e1f7f",   // tu color principal
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60, paddingBottom: 5 },

        tabBarIcon: ({ color }) => {
          let iconSource;

          if (route.name === "Inicio") iconSource = homeIcon;
          if (route.name === "Seguidores") iconSource = followersIcon;
          if (route.name === "Seguidos") iconSource = followingIcon;
          if (route.name === "Perfil") iconSource = profileIcon;

          return (
            <Image
              source={iconSource}
              style={{
                width: 26,
                height: 26,
                tintColor: color,  // respeta active/inactive tint
              }}
            />
          );
        },
      })}
    >

      <Tab.Screen name="Inicio">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown:false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateTweet" component={CreateTweetScreen} />
            <Stack.Screen name="Comments" component={CommentsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
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
