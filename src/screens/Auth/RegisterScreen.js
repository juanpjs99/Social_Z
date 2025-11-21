import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, Image
} from "react-native";
import { registerUser } from "../../api/api";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const res = await registerUser({ fullName, username, email, password });

      if (res && (res._id || (res.data && res.data._id))) {
        Alert.alert("Éxito", "Usuario registrado correctamente");
        navigation.navigate("Login");
      } else {
        const errorMessage =
          (res && (res.message || (res.data && res.data.message))) ||
          "No se pudo registrar el usuario";
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Error en register:", error);
      Alert.alert("Error", "Ocurrió un problema al registrar el usuario");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      <Image
        source={require("../../assets/logo.png")} // ruta a tu imagen local
        style={styles.logo}
      />
      <Text style={styles.title}>Crear Cuenta</Text>
      </View>
      

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#aaa"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#f5f5f5", // Gray100 fondo limpio
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
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  button: {
    backgroundColor: "#8e1f7f", // Primary
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#8e1f7f",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  buttonText: {
    color: "#ffffff", // Text Light
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
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
    marginBottom: 30,
  },

  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
});
