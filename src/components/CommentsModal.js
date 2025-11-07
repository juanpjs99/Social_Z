import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { agregarComentario, eliminarComentario } from "../api/api";

export default function CommentsModal({ visible, tweet, onClose, userId, onCommentAdded }) {
  const [comentario, setComentario] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleAgregarComentario = async () => {
    if (comentario.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    setCargando(true);
    try {
      await agregarComentario(tweet._id, userId, comentario);
      setComentario("");
      onCommentAdded();
      Alert.alert("Success", "Comment added");
    } catch (error) {
      Alert.alert("Error", "Could not add comment");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarComentario = async (commentId) => {
    Alert.alert(
      "Delete comment",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarComentario(tweet._id, commentId);
              onCommentAdded();
            } catch (error) {
              Alert.alert("Error", "Could not delete comment");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Tweet Original */}
        <View style={styles.tweetOriginal}>
          <Text style={styles.username}>{tweet.author?.username}</Text>
          <Text style={styles.tweetText}>{tweet.text}</Text>
          <Text style={styles.tweetDate}>
            {new Date(tweet.createdAt).toLocaleDateString("en-US")}
          </Text>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Comment form */}
        <View style={styles.formulario}>
          <TextInput
            placeholder="What do you think?"
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
            style={styles.input}
          />
          <Button
            title={cargando ? "Posting..." : "Comment"}
            onPress={handleAgregarComentario}
            disabled={cargando}
            color="#1DA1F2"
          />
        </View>

        <View style={styles.divider} />

        {/* Lista de Comentarios */}
        <ScrollView style={styles.comentariosList}>
          {tweet.comments && tweet.comments.length > 0 ? (
            tweet.comments.map((comment) => (
              <View key={comment._id} style={styles.comentario}>
                <View style={styles.comentarioHeader}>
                  <Text style={styles.comentarioAutor}>
                    @{comment.author?.username}
                  </Text>
                  <Text style={styles.comentarioFecha}>
                    {new Date(comment.createdAt).toLocaleDateString("en-US")}
                  </Text>
                </View>

                <Text style={styles.comentarioTexto}>{comment.text}</Text>

                {/* Botón de eliminar (solo si es tu comentario) */}
                {userId === comment.author?._id && (
                  <TouchableOpacity
                    onPress={() => handleEliminarComentario(comment._id)}
                    style={styles.deleteBtn}
                  >
                  <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.sinComentarios}>
              <Text style={styles.sinComentariosText}>
                No comments yet. Be the first!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1DA1F2",
    padding: 10,
  },
  tweetOriginal: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#1DA1F2",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  tweetText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    lineHeight: 20,
  },
  tweetDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  formulario: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#000",
    maxHeight: 100,
  },
  comentariosList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  comentario: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  comentarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  comentarioAutor: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1DA1F2",
  },
  comentarioFecha: {
    fontSize: 12,
    color: "#999",
  },
  comentarioTexto: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
    marginBottom: 8,
  },
  deleteBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#ffe0e0",
    borderRadius: 4,
    marginTop: 8,
  },
  deleteBtnText: {
    fontSize: 12,
    color: "#ff4444",
    fontWeight: "bold",
  },
  sinComentarios: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  sinComentariosText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
