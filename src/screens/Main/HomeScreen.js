

import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  Image,


  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


import { crearTweet, obtenerTweets, eliminarTweet } from "../../api/api";
import { launchImageLibrary } from 'react-native-image-picker';

export default function HomeScreen({ navigation }) {
  const [tweets, setTweets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTweet, setNuevoTweet] = useState("");
  const [image, setImage] = useState(null); // { uri, base64, type }

  // userId real obtenido desde el storage (guardado al iniciar sesión)
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) setUserId(id);
      } catch (e) {
        console.error('Error cargando userId:', e);
      }
      cargarTweets();
    };
    load();
  }, []);

  const cargarTweets = async () => {
    try {
      const data = await obtenerTweets();
      setTweets(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los tweets");
    }
  };

  const publicarTweet = async () => {
    if (nuevoTweet.trim() === "") {
      Alert.alert("Error", "El tweet no puede estar vacío");
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'Debes iniciar sesión para publicar');
      return;
    }

    try {
      console.log("Intentando crear tweet con:", { userId, texto: nuevoTweet });
      const imagePayload = image && image.base64 ? `data:${image.type};base64,${image.base64}` : "";
      const resultado = await crearTweet(userId, nuevoTweet, imagePayload);
      console.log("Tweet creado exitosamente:", resultado);
      setNuevoTweet("");
      setImage(null);
      setModalVisible(false);
      cargarTweets();
    } catch (error) {
      console.error("Error al crear tweet:", error.response?.data || error.message);
      Alert.alert("Error", `No se pudo publicar el tweet: ${error.response?.data?.message || error.message}`);
    }
  };

  const pickImage = async () => {
    try {
      // En Android necesitaremos pedir permiso de lectura de medios en tiempo de ejecución
      if (Platform.OS === 'android') {
        try {
          const api33 = parseInt(Platform.Version, 10) >= 33;
          const permission = api33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          const granted = await PermissionsAndroid.request(permission);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a tus imágenes');
            return;
          }
        } catch (permErr) {
          console.error('Error pidiendo permiso:', permErr);
          // continuar e intentar abrir el selector
        }
      }

      const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
      if (!res) return;
      if (res.didCancel) return;
      if (res.errorCode) {
        console.error('ImagePicker error', res.errorMessage);
        Alert.alert('Error', `No se pudo seleccionar la imagen (${res.errorMessage || res.errorCode})`);
        return;
      }
      const asset = res.assets && res.assets[0];
      if (asset) {
        setImage({ uri: asset.uri, base64: asset.base64, type: asset.type });
      }
    } catch (e) {
      console.error('Error pickImage', e);
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + (e.message || e));
    }
  };

  const confirmarEliminar = (id) => {
    Alert.alert(
      'Confirmar',
      '¿Deseas eliminar este tweet?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
      ]
    );
  };

  const eliminar = async (id) => {
    try {
      await eliminarTweet(id);
      cargarTweets();
    } catch (error) {
      console.error('Error al eliminar tweet:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo eliminar el tweet');
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>


        <TouchableOpacity style={styles.newButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.newButtonText}>Nuevo Tweet</Text>
        </TouchableOpacity>
      </View>

      {/* Botones para navegar */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Seguidores")}
        >
          <Ionicons name="people-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Seguidores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Seguidos")}
        >
          <Ionicons name="person-add-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Seguidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Ionicons name="person-circle-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={tweets}


        keyExtractor={(item) => item._id || item.id} // Maneja _id de mongo o id falso
        renderItem={({ item }) => (
          <View style={styles.tweetCard}>
            <View style={styles.tweetHeaderRow}>
              <Text style={styles.user}>@{item.author?.username || "user"}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => confirmarEliminar(item._id || item.id)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.tweet}>{item.text || item.content}</Text>
            
            {/* Mostrar imagen si existe */}
            {item.image && (
              <Image 
                source={{ uri: item.image }} 
                style={styles.tweetImage}
                resizeMode="cover"
              />
            )}
          </View>
        )}
      />

      {/* Modal para crear tweet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="¿Qué está pasando?"
              multiline
              value={nuevoTweet}
              onChangeText={setNuevoTweet}
            />
            <View style={styles.imageButtonContainer}>
              <Button title={image ? 'Quitar imagen' : 'Agregar imagen'} onPress={() => image ? setImage(null) : pickImage()} />
            </View>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            ) : null}
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Publicar" onPress={publicarTweet} />
            </View>
          </View>
        </View>

      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1DA1F2" },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  navButton: { alignItems: "center" },
  navText: { marginTop: 3, color: "#1DA1F2", fontSize: 13 },
  tweetCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  user: { fontWeight: "600", marginBottom: 4 },
  tweet: { fontSize: 15 },

  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  input: {
    minHeight: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },  
  newButton: {
    width: 70,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    color: '#1DA1F2',
    fontWeight: '700',
  },
  tweetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  imageButtonContainer: {
    marginBottom: 10,
  },



});