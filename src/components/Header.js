import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ username, onLogout }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>🐦 AppX</Text>
      <Text style={styles.user}>@{username}</Text>
      <TouchableOpacity onPress={onLogout}>
        <Text style={styles.logout}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#e6f0ff' },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#1DA1F2' },
  user: { color: '#333' },
  logout: { color: 'red' },
});
