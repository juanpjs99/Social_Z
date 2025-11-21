import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ title, showBackButton = false }) {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
            // Reset navigation to Login screen
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }
        }
      ]
    );
  };

  const handleLogoPress = () => {
    // Navigate to home tab
    navigation.navigate('Inicio');
  };

  return (
    <View style={styles.header}>
      {/* Left side: Logo or Back button */}
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1DA1F2" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title or Username */}
      <View style={styles.centerSection}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Text style={styles.username}>@{user?.username}</Text>
        )}
      </View>

      {/* Right side: Logout */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Image 
            source={require('../assets/logout-icon.png')} 
            style={styles.logoutIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 15,

    backgroundColor: "#ffffff",

    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",

    // Sombra premium
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  leftSection: {
    width: 50,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  rightSection: {
    width: 50,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  logoContainer: {
    padding: 6,
    borderRadius: 12,
  },

  logo: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a", // Text Dark
    letterSpacing: 0.3,
  },

  username: {
    fontSize: 15,
    color: "#657786",
    fontWeight: "600",
    marginTop: 2,
  },

  logoutButton: {
    padding: 8,
    borderRadius: 50,

    backgroundColor: "#fde7f8", // suave derivado del primary (#8e1f7f)
    borderWidth: 1,
    borderColor: "#f7c4ef",
  },

  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: "#8e1f7f", // Primary
  },
});

