import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "../../api/api"

const LoginScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
  if (!form.email || !form.password) {
    return Alert.alert("Error", "Please fill in all fields");
  }

  try {
    const data = await loginUser(form);

    if (!data.token) {
      throw new Error(data.message || "Login error");
    }

    // Guardar token y nombre de usuario
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("username", data.username);
    // Guardar userId (para publicar tweets)
    if (data.id) {
      await AsyncStorage.setItem("userId", data.id);
    }

  Alert.alert("Welcome", `Hi ${data.username}!`);

    // Redirigir al Home (reemplaza la pantalla actual)
    navigation.replace("MainTabs");

  } catch (error) {
    console.error("Error en login:", error);
    Alert.alert("Error", error.message || "Invalid credentials");
  }
};


  return (
    <View style={styles.container}>
  <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
  placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
      />

      <TextInput
        style={styles.input}
  placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
  <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
  <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    color: "#007bff",
    textAlign: "center",
    fontSize: 16,
  },
});
