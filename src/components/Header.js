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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  leftSection: {
    width: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoContainer: {
    padding: 5,
  },
  logo: {
    width: 35,
    height: 35,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14171a',
  },
  username: {
    fontSize: 15,
    color: '#657786',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
});
