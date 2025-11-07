import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { obtenerTweets, likeTweet } from "../../api/api";
import CommentsModal from "../../components/CommentsModal";
import { useAuth } from "../../context/AuthContext";

export default function FeedScreen() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tweetSeleccionado, setTweetSeleccionado] = useState(null);
  const [likesCargando, setLikesCargando] = useState({});

  const loadTweets = async () => {
    try {
      const data = await obtenerTweets();
      setTweets(data);
    } catch (error) {
      console.error("Error al cargar tweets:", error);
      Alert.alert("Error", "No se pudieron cargar los tweets");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadTweets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTweets();
    setRefreshing(false);
  };

  const handleLike = async (tweetId, isLiked) => {
    if (!user?._id) {
      Alert.alert("Error", "Debes iniciar sesión");
      return;
    }

    setLikesCargando((prev) => ({ ...prev, [tweetId]: true }));

    try {
      await likeTweet(tweetId, user._id);
      // Recargar tweets para ver el cambio
      await loadTweets();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el like");
    } finally {
      setLikesCargando((prev) => ({ ...prev, [tweetId]: false }));
    }
  };

  const handleAbrirComentarios = (tweet) => {
    setTweetSeleccionado(tweet);
    setModalVisible(true);
  };

  const isLikedByUser = (tweet) => {
    return tweet.likes?.some((like) => like._id === user?._id);
  };

  const renderTweet = ({ item }) => {
    const isLiked = isLikedByUser(item);
    const likesCount = item.likes?.length || 0;
    const commentsCount = item.comments?.length || 0;

    return (
      <View style={styles.tweetContainer}>
        {/* Header del Tweet */}
        <View style={styles.tweetHeader}>
          <View>
            <Text style={styles.username}>@{item.author?.username}</Text>
            <Text style={styles.email}>{item.author?.email}</Text>
          </View>
          <Text style={styles.fecha}>
            {new Date(item.createdAt).toLocaleDateString("es-ES")}
          </Text>
        </View>

        {/* Contenido */}
        <Text style={styles.tweetText}>{item.text}</Text>

        {/* Imagen si existe */}
        {item.image && (
          <View style={styles.imageContainer}>
            {/* Placeholder ya que no tenemos componente Image configuro */}
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📷 Imagen</Text>
            </View>
          </View>
        )}

        {/* Estadísticas */}
        <View style={styles.stats}>
          <Text style={styles.statText}>❤️ {likesCount} likes</Text>
          <Text style={styles.statText}>💬 {commentsCount} comentarios</Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.acciones}>
          <TouchableOpacity
            style={[styles.boton, isLiked && styles.botonLikeActive]}
            onPress={() => handleLike(item._id, isLiked)}
            disabled={likesCargando[item._id]}
          >
            {likesCargando[item._id] ? (
              <ActivityIndicator size="small" color={isLiked ? "#8A2BE2" : "#666"} />
            ) : (
              <>
                <Text style={[styles.botonTexto, isLiked && styles.botonTextoActive]}>
                  {isLiked ? "👍 Me gusta" : "🤍 Me gusta"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boton}
            onPress={() => handleAbrirComentarios(item)}
          >
            <Text style={styles.botonTexto}>💬 Comentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.loadingText}>Cargando tweets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tweets}
        keyExtractor={(item) => item._id}
        renderItem={renderTweet}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay tweets aún</Text>
          </View>
        }
      />

      {/* Modal de Comentarios */}
      {tweetSeleccionado && (
        <CommentsModal
          visible={modalVisible}
          tweet={tweetSeleccionado}
          onClose={() => setModalVisible(false)}
          userId={user?._id}
          onCommentAdded={() => {
            loadTweets();
            setTweetSeleccionado(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e27",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e27",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#a0a0a0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#a0a0a0",
  },
  tweetContainer: {
    margin: 12,
    padding: 16,
    backgroundColor: "#1a1f3a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#8A2BE2",
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tweetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  email: {
    fontSize: 12,
    color: "#a0a0a0",
    marginTop: 2,
  },
  fecha: {
    fontSize: 11,
    color: "#8A2BE2",
    fontWeight: "600",
  },
  tweetText: {
    fontSize: 16,
    color: "#e0e0e0",
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
  },
  imagePlaceholder: {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8A2BE2",
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 24,
    color: "#8A2BE2",
  },
  stats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(138, 43, 226, 0.3)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(138, 43, 226, 0.3)",
  },
  statText: {
    fontSize: 13,
    color: "#8A2BE2",
    fontWeight: "600",
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(138, 43, 226, 0.2)",
    borderWidth: 1,
    borderColor: "#8A2BE2",
    alignItems: "center",
    justifyContent: "center",
  },
  botonLikeActive: {
    backgroundColor: "rgba(138, 43, 226, 0.4)",
    borderColor: "#FF1493",
    shadowColor: "#FF1493",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  botonTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A2BE2",
  },
  botonTextoActive: {
    color: "#FF1493",
    fontWeight: "bold",
  },
});
