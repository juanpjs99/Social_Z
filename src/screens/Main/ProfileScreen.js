import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ setUser }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const savedUsername = await AsyncStorage.getItem("username");
      setUsername(savedUsername || "Usuario");
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("username");
    setUser(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>@{username}</Text>
      <Text style={styles.stats}>Seguidores: 12 | Seguidos: 8</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} color="#1DA1F2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  stats: { color: "gray", marginBottom: 20 },
});
