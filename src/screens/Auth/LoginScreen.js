import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loginUser } from "../../api/api";
import { showMessage } from '../../utils/notify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../../context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return showMessage('Error', 'Por favor completa todos los campos');
    }

    try {
  const data = await loginUser(form);

      if (!data.token) {
        throw new Error(data.message || "Error en el inicio de sesión");
      }

      // save all user data to context
      // Persist id so other screens (Home) can access it for likes/comments
      if (data.id) {
        await AsyncStorage.setItem('userId', String(data.id));
      }
      await login({
        token: data.token,
        id: data.id,
        username: data.username,
        email: data.email,
      });

  // Usar mensaje diferido para evitar alerta antes de que la Activity esté lista
  setTimeout(() => showMessage('Bienvenido', `Hola ${data.username}!`, { toast: true }), 300);

      // navigate to main app
      navigation.replace("MainTabs");

    } catch (error) {
      console.error("Error en login:", error);
  showMessage('Error', error.message || 'Credenciales inválidas');
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")} // ruta a tu imagen local
              style={styles.logo}
            />
            
      </View>
            
      <Text style={styles.title}>Iniciar Sesión</Text>

      

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>¿No tienes una cuenta? Regístrate</Text>
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
    backgroundColor: "#8e1f7fff",
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
    color: "#8e1f7fff",
    textAlign: "center",
    fontSize: 16,
  },
  logoContainer: {
    width: "100%",          // ocupa todo el ancho del contenedor
    alignItems: "center",   // centra horizontalmente
    marginBottom: 20,       // espacio debajo del logo
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",  // mantiene proporción
  },
});
