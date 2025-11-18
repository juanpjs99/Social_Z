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
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

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
