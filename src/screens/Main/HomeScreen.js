import { useEffect, useState, useRef } from "react";
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
import { launchImageLibrary } from 'react-native-image-picker';
import CommentsModal from "../../components/CommentsModal";
import { crearTweet, obtenerTweets, eliminarTweet, likeTweet } from "../../api/api";

// Base del servidor (coincide con src/api/api.js)
const SERVER_BASE = 'http://10.0.2.2:5000';
function normalizeImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('data:')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `${SERVER_BASE}${imagePath}`;
  return imagePath;
}

export default function HomeScreen({ navigation }) {
  const [tweets, setTweets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTweet, setNuevoTweet] = useState("");
  const [image, setImage] = useState(null); // { uri, base64, type }
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [likesLoading, setLikesLoading] = useState({});
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState(null);

  // userId real obtenido desde el storage (guardado al iniciar sesión)
  const [userId, setUserId] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const load = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) setUserId(id);
      } catch (e) {
        console.error('Error cargando userId:', e);
      }
      // cargar tweets después de obtener userId
      cargarTweets();
    };
    load();
    return () => { isMounted.current = false; };
  }, []);

  const cargarTweets = async () => {
    try {
      const data = await obtenerTweets();
      setTweets(data);
    } catch (error) {
  Alert.alert("Error", "Could not load tweets");
    }
  };

  const publicarTweet = async () => {
    // Permitimos publicar cuando haya texto o una imagen
    if (nuevoTweet.trim() === "" && !image) {
      if (isMounted.current) Alert.alert("Error", "Tweet cannot be empty");
      return;
    }

    if (!userId) {
      if (isMounted.current) Alert.alert('Error', 'You must be logged in to post');
      return;
    }

    try {
      setSubmitting(true);
      const imagePayload = image ? { uri: image.uri, type: image.type, name: image.uri.split('/').pop() } : null;
      await crearTweet(userId, nuevoTweet, imagePayload);
      setNuevoTweet("");
      setImage(null);
      setModalVisible(false);
      setTimeout(() => cargarTweets(), 400);
      if (isMounted.current) Alert.alert('Success', 'Tweet posted successfully');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      if (isMounted.current) Alert.alert("Error", `Could not post tweet: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async () => {
    try {
      // En Android pedir permiso en tiempo de ejecución
      if (Platform.OS === 'android') {
        try {
          const api33 = parseInt(Platform.Version, 10) >= 33;
          const permission = api33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          const granted = await PermissionsAndroid.request(permission);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission denied', 'We need permission to access your images');
            return;
          }
        } catch (permErr) {
          console.error('Error pidiendo permiso:', permErr);
        }
      }

      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (!res || res.didCancel || res.errorCode) {
        if (res?.errorCode) {
          Alert.alert('Error', `Could not select image (${res.errorMessage || res.errorCode})`);
        }
        return;
      }

      const asset = res.assets?.[0];
      if (asset?.uri) {
        setImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || asset.uri.split('/').pop()
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not select image: ' + (e.message || e));
    }
  };

  const confirmarEliminar = (id) => {
    Alert.alert(
      'Confirm',
      'Do you want to delete this tweet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => eliminar(id) },
      ]
    );
  };

  const eliminar = async (id) => {
    try {
      setDeletingId(id);
      await eliminarTweet(id);
      setTweets(prev => prev.filter(t => (t._id || t.id) !== id));
      setTimeout(() => cargarTweets(), 300);
      if (isMounted.current) Alert.alert('Deleted', 'Tweet deleted successfully');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      if (isMounted.current) Alert.alert('Error', `Could not delete tweet: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  // --- Likes ---
  const isLikedByUser = (tweet) => {
    if (!userId || !tweet?.likes) return false;
    return tweet.likes.some((l) => (typeof l === 'string' ? l === userId : (l?._id || String(l)) === String(userId)));
  };

  const onToggleLike = async (tweetId) => {
    if (!userId) {
      Alert.alert('Login required', 'You must be logged in to like');
      return;
    }
    setLikesLoading((prev) => ({ ...prev, [tweetId]: true }));
    try {
      await likeTweet(tweetId, userId);
      await cargarTweets();
    } catch (e) {
      Alert.alert('Error', 'Could not process like');
    } finally {
      setLikesLoading((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  // --- Comentarios ---
  const abrirComentarios = (tweet) => {
    setSelectedTweet(tweet);
    setCommentsVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.newButtonText}>New Tweet</Text>
        </TouchableOpacity>
      </View>

      {/* Botones para navegar */}
      <View style={styles.navButtons}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Followers")}
        >
          <Ionicons name="people-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Following")}
        >
          <Ionicons name="person-add-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Following</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={22} color="#1DA1F2" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={tweets}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          const imageUri = normalizeImageUrl(item.image);
          return (
            <View style={styles.tweetCard}>
              <View style={styles.tweetHeaderRow}>
                <Text style={styles.user}>@{item.author?.username || "user"}</Text>
                <TouchableOpacity
                  style={[styles.deleteButton, deletingId === (item._id || item.id) ? { opacity: 0.6 } : null]}
                  onPress={() => confirmarEliminar(item._id || item.id)}
                  disabled={deletingId === (item._id || item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.tweet}>{item.text || item.content}</Text>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.tweetImage} />
              ) : null}

              {/* Stats */}
              <View style={styles.statsRow}>
                <Text style={styles.statText}>❤️ {item?.likes?.length || 0}</Text>
                <Text style={styles.statText}>💬 {item?.comments?.length || 0}</Text>
              </View>

              {/* Acciones */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, isLikedByUser(item) && styles.likeActive]}
                  onPress={() => onToggleLike(item._id || item.id)}
                  disabled={!!likesLoading[item._id || item.id]}
                >
                  <Text style={[styles.actionText, isLikedByUser(item) && styles.actionTextActive]}>
                    {likesLoading[item._id || item.id] ? '...' : (isLikedByUser(item) ? '👍 Like' : '🤍 Like')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => abrirComentarios(item)}>
                  <Text style={styles.actionText}>💬 Comment</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: 'center', color: '#888' }}>No tweets yet</Text>
          </View>
        }
      />

      {/* Modal para crear tweet */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="What's happening?"
              multiline
              value={nuevoTweet}
              onChangeText={setNuevoTweet}
            />
            <View style={{ marginBottom: 10 }}>
                <Button title={image ? 'Remove image' : 'Add image'} onPress={() => image ? setImage(null) : pickImage()} />
            </View>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            ) : null}
            <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} disabled={submitting} />
                <Button title="Post" onPress={publicarTweet} disabled={submitting} />
            </View>
          </View>
        </View>

      </Modal>

      {/* Modal de comentarios */}
      {selectedTweet && (
        <CommentsModal
          visible={commentsVisible}
          tweet={selectedTweet}
          userId={userId}
          onClose={() => setCommentsVisible(false)}
          onCommentAdded={() => {
            setCommentsVisible(false);
            setSelectedTweet(null);
            cargarTweets();
          }}
        />
      )}
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
    backgroundColor: "#1a1f3a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#8A2BE2",
  },
  user: { fontWeight: "700", marginBottom: 4, color: '#fff' },
  tweet: { fontSize: 15, color: '#eaeaea' },

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
    marginTop: 8,
    resizeMode: 'cover',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(138,43,226,0.3)',
    marginTop: 10,
    marginBottom: 10,
  },
  statText: { color: '#8A2BE2', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(138,43,226,0.2)',
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  likeActive: {
    backgroundColor: 'rgba(138,43,226,0.4)',
    borderColor: '#FF1493',
  },
  actionText: { color: '#8A2BE2', fontWeight: '700' },
  actionTextActive: { color: '#FF1493' },
});