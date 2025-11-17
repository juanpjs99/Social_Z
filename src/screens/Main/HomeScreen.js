

import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";


import { obtenerTweets, eliminarTweet, likeTweet, followUser } from "../../api/api";
import { showMessage } from '../../utils/notify';
import { formatTweet } from '../../utils/tweetFormat';

export default function HomeScreen({ navigation }) {
  // Base del servidor para normalizar rutas relativas de imágenes (/uploads/...)
  const SERVER_BASE = 'http://10.0.2.2:5000';
  const [tweets, setTweets] = useState([]);
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [likesLoading, setLikesLoading] = useState({});

  // Real userId obtained from storage (saved when logging in)
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        let id = await AsyncStorage.getItem('userId');
        if (!id) {
          const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
              try {
                const parsed = JSON.parse(storedUser);
                if (parsed?.id) id = String(parsed.id);
              } catch (e) { /* ignore parse errors */ }
            }
        }
        if (id) setUserId(id);
      } catch (e) {
        console.error('Error loading userId:', e);
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
  showMessage('Error', 'No se pudieron cargar los tweets', { toast: true });
    }
  };

  // publicarTweet y selección de imagen se movieron a CreateTweetScreen

  const confirmarEliminar = (id) => {
    showMessage('Confirmar', 'Abriendo diálogo...');
    // Mantener diálogo nativo para eliminar (Alert requerido) pero se dispara después de actividad lista
    setTimeout(() => {
      import('react-native').then(({ Alert }) => {
        Alert.alert(
          'Confirmar',
          '¿Deseas eliminar este tweet?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(id) },
          ]
        );
      });
    }, 100);
  };

  const eliminar = async (id) => {
    try {
      if (!userId) {
  showMessage('Error', 'Debes iniciar sesión');
        return;
      }
      await eliminarTweet(id, userId);
      cargarTweets();
    } catch (error) {
      console.error('Error al eliminar tweet:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'No se pudo eliminar el tweet';
  showMessage('Error', errorMsg);
    }
  };

  // --- Likes ---
  const isLikedByUser = (tweet) => {
    if (!userId || !tweet?.likes) return false;
    return tweet.likes.some((l) => (typeof l === 'string' ? l === userId : (l?._id || String(l)) === String(userId)));
  };

  const onToggleLike = async (tweetId) => {
    if (!userId) {
  showMessage('Login required', 'You must be logged in to like');
      return;
    }
    setLikesLoading((prev) => ({ ...prev, [tweetId]: true }));
    try {
      await likeTweet(tweetId, userId);
      await cargarTweets();
    } catch (e) {
  showMessage('Error', 'No se pudo procesar el like');
    } finally {
      setLikesLoading((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  // --- Comentarios ---
  const abrirComentarios = (tweet) => {
    navigation.navigate('Comments', { tweet, refreshHome: cargarTweets });
  };

  return (
    <View style={styles.container}>
      <Header title="Home" />

      {/* Menú vertical estilo lista */}
      <View style={styles.navMenu}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inicio')}>
          <Ionicons name="home-outline" size={20} color="#1DA1F2" />
          <Text style={styles.navItemText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Seguidores')}>
          <Ionicons name="people-outline" size={20} color="#1DA1F2" />
          <Text style={styles.navItemText}>Seguidores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Seguidos')}>
          <Ionicons name="person-add-outline" size={20} color="#1DA1F2" />
          <Text style={styles.navItemText}>Seguidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle-outline" size={20} color="#1DA1F2" />
          <Text style={styles.navItemText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Tweet feed */}
      <FlatList
        data={tweets}


        keyExtractor={(item) => item._id || item.id} // Maneja _id de mongo o id falso
        renderItem={({ item }) => {
          return (
            <View style={styles.tweetCard}>
              {item.author?._id === userId && (
                <TouchableOpacity style={styles.deleteButtonTop} onPress={() => confirmarEliminar(item._id || item.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
              {(() => {
                const { header, body } = formatTweet(item.author, item.text || item.content, item.createdAt || item.timestamp);
                return (
                  <View>
                    <View style={styles.tweetHeaderRow}>
                      <Text style={styles.tweetHeaderText}>{header}</Text>
                    </View>
                    {item.author?._id !== userId && !item.author?.followers?.some(f => f.toString() === userId) && (
                      <TouchableOpacity style={styles.followBtn} onPress={async () => {
                        try {
                          await followUser(item.author._id, userId);
                          showMessage('Seguido', 'Ahora sigues a este usuario', { toast: true });
                          cargarTweets();
                        } catch (e) {
                          showMessage('Error', e.response?.data?.message || e.message || 'No se pudo seguir');
                        }
                      }}>
                        <Text style={styles.followBtnText}>Seguir</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.tweetBody}>{body}</Text>
                  </View>
                );
              })()}
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.tweetImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.statsRow}>
                <Text style={styles.statText}>❤️ {item?.likes?.length || 0}</Text>
                <Text style={styles.statText}>💬 {item?.comments?.length || 0}</Text>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, isLikedByUser(item) && styles.likeActive]}
                  onPress={() => onToggleLike(item._id || item.id)}
                  disabled={!!likesLoading[item._id || item.id]}
                >
                  <Text style={[styles.actionText, isLikedByUser(item) && styles.actionTextActive]}>
                    {likesLoading[item._id || item.id] ? '...' : (isLikedByUser(item) ? '👍 Me gusta' : '🤍 Me gusta')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => abrirComentarios(item)}>
                  <Text style={styles.actionText}>💬 Comentar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Floating action button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTweet')} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navMenu:{
    flexDirection:'column',
    paddingHorizontal:15,
    paddingVertical:10,
    gap:6,
  },
  navItem:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:6 },
  navItemText:{ color:'#1DA1F2', fontSize:14, fontWeight:'600' },
  tweetCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  tweetHeaderText:{ fontWeight:'600', fontSize:13, color:'#222' },
  tweetBody:{ marginTop:8, fontSize:14, color:'#000', lineHeight:20, marginBottom:6 },

  // Modal
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
  modalActionBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalActionText: { color: '#fff', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#1DA1F2' },
  secondaryBtn: { backgroundColor: '#555' },
  cancelBtn: { backgroundColor: '#ff4d4f' },
  disabledBtn: { backgroundColor: '#999' },
  loginHint: { marginTop: 10, color: '#ff4d4f', textAlign: 'center', fontSize: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  deleteButtonTop: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff4d4f',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 10,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
    marginBottom: 10,
  },
  statText: { color: '#555', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#eef6ff',
    borderWidth: 1,
    borderColor: '#1DA1F2',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  likeActive: {
    backgroundColor: '#e3f2ff',
    borderColor: '#FF1493',
  },
  actionText: { color: '#1DA1F2', fontWeight: '700' },
  actionTextActive: { color: '#FF1493' },
  imageButtonContainer: {
    marginBottom: 10,
  },
  followBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },



});