import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, Alert } from "react-native";
import { crearTweet, obtenerTweets } from "../../api/api"; // Ajusta ruta

export default function CrearTweetScreen({ userId }) {
  const [nuevoTweet, setNuevoTweet] = useState("");
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    cargarTweets();
  }, []);

  const cargarTweets = async () => {
    try {
      const data = await obtenerTweets();
      setTweets(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar los tweets");
    }
  };

  const publicarTweet = async () => {
    if (nuevoTweet.trim() === "") {
      Alert.alert("Error", "El tweet no puede estar vacío");
      return;
    }

    try {
      await crearTweet(userId, nuevoTweet, "");
      setNuevoTweet("");
      cargarTweets();
    } catch (error) {
      Alert.alert("Error", "No se pudo publicar el tweet");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="¿Qué está pasando?"
        value={nuevoTweet}
        onChangeText={setNuevoTweet}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <Button title="Publicar" onPress={publicarTweet} />

      <FlatList
        data={tweets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold" }}>{item.author.username}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}
