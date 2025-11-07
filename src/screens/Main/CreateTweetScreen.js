import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import { crearTweet, obtenerTweets } from "../../api/api"; // Ajusta ruta

export default function CrearTweetScreen({ userId }) {
  const [nuevoTweet, setNuevoTweet] = useState("");
  const [tweets, setTweets] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const seleccionarImagen = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la selección de imagen');
      } else if (response.errorCode) {
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: `data:${asset.type};base64,${asset.base64}`,
        });
      }
    });
  };

  const publicarTweet = async () => {
    if (nuevoTweet.trim() === "" && !selectedImage) {
      Alert.alert("Error", "El tweet no puede estar vacío");
      return;
    }

    try {
      const imageData = selectedImage ? selectedImage.base64 : "";
      await crearTweet(userId, nuevoTweet, imageData);
      setNuevoTweet("");
      setSelectedImage(null);
      cargarTweets();
    } catch (error) {
      Alert.alert("Error", "No se pudo publicar el tweet");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="¿Qué está pasando?"
        value={nuevoTweet}
        onChangeText={setNuevoTweet}
        style={styles.input}
        multiline
      />
      
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="📷 Imagen" onPress={seleccionarImagen} />
        <Button title="Publicar" onPress={publicarTweet} />
      </View>

      <FlatList
        data={tweets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.tweetItem}>
            <Text style={styles.username}>{item.author.username}</Text>
            <Text>{item.text}</Text>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.tweetImage} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tweetItem: {
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
});
