import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, Alert, Image, TouchableOpacity, StyleSheet, ScrollView, Button } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { crearTweet, obtenerTweets } from "../../api/api";

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
      {/* Create tweet section */}
      <View style={styles.createSection}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Tweet</Text>
        </View>

        <TextInput
          placeholder="What's happening?"
          placeholderTextColor="#999"
          value={nuevoTweet}
          onChangeText={setNuevoTweet}
          style={styles.input}
          multiline
          maxLength={280}
        />
        
        <Text style={styles.charCount}>{nuevoTweet.length}/280</Text>

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={seleccionarImagen}
          >
            <Ionicons name="image-outline" size={24} color="#1DA1F2" />
            <Text style={styles.imageButtonText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tweetButton, (!nuevoTweet.trim() && !selectedImage) && styles.tweetButtonDisabled]} 
            onPress={publicarTweet}
            disabled={!nuevoTweet.trim() && !selectedImage}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.tweetButtonText}>Tweet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Tweet feed */}
      <Text style={styles.feedTitle}>Recent Tweets</Text>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.tweetCard}>
            <View style={styles.tweetHeader}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#1DA1F2" />
              </View>
              <View style={styles.tweetContent}>
                <Text style={styles.username}>@{item.author.username}</Text>
                <Text style={styles.tweetText}>{item.text}</Text>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.tweetImage} />
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tweets yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  createSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  input: {
    fontSize: 16,
    color: '#14171a',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#657786',
    marginBottom: 12,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e8f5fe',
  },
  imageButtonText: {
    color: '#1DA1F2',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  tweetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#1DA1F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tweetButtonDisabled: {
    backgroundColor: '#aab8c2',
    elevation: 0,
  },
  tweetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  divider: {
    height: 8,
    backgroundColor: '#e1e8ed',
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171a',
    padding: 16,
    backgroundColor: '#fff',
  },
  tweetCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tweetHeader: {
    flexDirection: 'row',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tweetContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#14171a',
    marginBottom: 4,
  },
  tweetText: {
    fontSize: 15,
    color: '#14171a',
    lineHeight: 20,
    marginBottom: 8,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#657786',
  },
});
