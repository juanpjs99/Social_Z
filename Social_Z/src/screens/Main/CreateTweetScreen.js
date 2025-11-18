import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";

export default function CreateTweetScreen({ navigation }) {
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (content.trim() === "") {
      Alert.alert("Error", "El tweet no puede estar vacío");
      return;
    }
    console.log("Nuevo tweet:", content);
    Alert.alert("Publicado", "Tu tweet fue publicado correctamente ✅");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="¿Qué está pasando?"
        multiline
        value={content}
        onChangeText={setContent}
        style={styles.textInput}
      />
      <Button title="Publicar" onPress={handlePost} color="#1DA1F2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  textInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
    fontSize: 16,
  },
});
