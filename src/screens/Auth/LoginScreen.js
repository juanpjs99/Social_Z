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
    backgroundColor: "#f5f5f5", // Gray100
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
    color: "#1a1a1a", // Text Dark
  },

  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc", // Gray300
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    
    // Sombras suaves, estilo moderno
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  button: {
    backgroundColor: "#8e1f7f", // Primary
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,

    // Sombra del color principal (bonito efecto glow)
    shadowColor: "#8e1f7f",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  link: {
    marginTop: 22,
    color: "#b845a8", // Primary Light
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },

  logoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
  },
});


