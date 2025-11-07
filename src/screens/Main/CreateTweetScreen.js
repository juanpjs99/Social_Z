import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, Alert, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { crearTweet, obtenerTweets } from "../../api/api";

export default function CrearTweetScreen({ userId }) {
  const [nuevoTweet, setNuevoTweet] = useState("");
  const [tweets, setTweets] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarTweets();
  }, []);

  const cargarTweets = async () => {
    try {
      const data = await obtenerTweets();
      setTweets(data || []);
    } catch (error) {
      console.error("Error al cargar tweets:", error);
    }
  };

  const seleccionarImagen = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User canceled selection");
        } else if (response.errorCode) {
          console.error("Error:", response.errorMessage);
          Alert.alert("Error", "Could not select image");
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImagenSeleccionada({
            uri: asset.uri,
            type: asset.type || "image/jpeg",
          });
        }
      }
    );
  };

  const tomarFoto = async () => {
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.7,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User canceled camera");
        } else if (response.errorCode) {
          console.error("Error:", response.errorMessage);
          Alert.alert("Error", "Could not take photo");
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImagenSeleccionada({
            uri: asset.uri,
            type: asset.type || "image/jpeg",
          });
        }
      }
    );
  };

  const publicarTweet = async () => {
    if (nuevoTweet.trim() === "" && !imagenSeleccionada) {
      Alert.alert("Error", "Tweet cannot be empty");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not identified");
      return;
    }

    setCargando(true);
    try {
  console.log("Posting tweet...", { userId, text: nuevoTweet, image: imagenSeleccionada ? "yes" : "no" });
      await crearTweet(userId, nuevoTweet, imagenSeleccionada);
      
      // Limpiar formulario
      setNuevoTweet("");
      setImagenSeleccionada(null);
      
      // Recargar tweets
      await cargarTweets();
      Alert.alert("Success", "Tweet posted successfully");
    } catch (error) {
      console.error("Error posting tweet:", error);
      const mensajeError = error.response?.data?.message || error.message || "Could not post tweet";
      Alert.alert("Error", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const limpiarImagen = () => {
    setImagenSeleccionada(null);
  };

  return (
    <ScrollView style={{ padding: 20, flex: 1, backgroundColor: "#fff" }}>
      {/* Formulario para crear tweet */}
      <View style={{ marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Create Tweet</Text>
        
        <TextInput
          placeholder="What's happening?"
          value={nuevoTweet}
          onChangeText={setNuevoTweet}
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 5,
            padding: 10,
            marginBottom: 10,
            fontSize: 16,
          }}
        />

        {/* Vista previa de imagen seleccionada */}
        {imagenSeleccionada && (
          <View style={{ marginBottom: 10 }}>
            <Image
              source={{ uri: imagenSeleccionada.uri }}
              style={{ width: "100%", height: 200, borderRadius: 5 }}
            />
            <TouchableOpacity
              onPress={limpiarImagen}
              style={{
                backgroundColor: "#ff4444",
                padding: 8,
                borderRadius: 5,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Remove image</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botones de acción */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <Button title="📷 Gallery" onPress={seleccionarImagen} />
          <Button title="📸 Camera" onPress={tomarFoto} />
        </View>

        <Button
          title={cargando ? "Posting..." : "Post Tweet"}
          onPress={publicarTweet}
          disabled={cargando}
          color="#1DA1F2"
        />
      </View>

      {/* Lista de tweets */}
      <View>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Feed</Text>
        {cargando && tweets.length === 0 ? (
          <ActivityIndicator size="large" color="#1DA1F2" />
        ) : tweets.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>No tweets yet</Text>
        ) : (
          <FlatList
            data={tweets}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={{
                  marginVertical: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#eee",
                  borderRadius: 5,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                  {item.author?.username || "Usuario anónimo"}
                </Text>
                <Text style={{ fontSize: 12, color: "#999", marginBottom: 5 }}>
                  {item.author?.email || ""}
                </Text>
                <Text style={{ fontSize: 14, marginBottom: 8 }}>{item.text}</Text>

                {/* Mostrar imagen si existe */}
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: "100%",
                      height: 150,
                      borderRadius: 5,
                      marginBottom: 8,
                    }}
                    onError={(error) => console.log("Error cargando imagen:", error)}
                  />
                )}

                <Text style={{ fontSize: 11, color: "#ccc" }}>
                  {new Date(item.createdAt).toLocaleDateString("en-US")}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
