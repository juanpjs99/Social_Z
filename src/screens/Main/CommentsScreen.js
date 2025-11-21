import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { agregarComentario, eliminarComentario } from '../../api/api';
import { formatTweet } from '../../utils/tweetFormat';
import { showMessage } from '../../utils/notify';

export default function CommentsScreen({ route, navigation }) {
  const { tweet, refreshHome } = route.params; // tweet object passed from Home
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const postComment = async () => {
    if (sending) return;
    if (!comment.trim()) {
  showMessage('Error', 'El comentario no puede estar vacío', { toast: true });
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
  showMessage('Error', 'Debes iniciar sesión');
        return;
      }
      setSending(true);
      await agregarComentario(tweet._id, userId, comment.trim());
      setComment('');
  showMessage('Éxito', 'Comentario agregado', { toast: true });
      // go back and refresh home screen
      navigation.goBack();
      refreshHome?.();
    } catch (e) {
  showMessage('Error', e.response?.data?.message || e.message || 'No se pudo comentar');
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (commentId) => {
    Alert.alert('Eliminar', '¿Eliminar este comentario?', [
      { text:'Cancelar', style:'cancel' },
      { text:'Eliminar', style:'destructive', onPress: async () => {
        try {
          await eliminarComentario(tweet._id, commentId);
          refreshHome?.();
        } catch (e) {
          showMessage('Error', 'No se pudo eliminar');
        }
      } }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentarios</Text>
      {(() => {
        const { header, body } = formatTweet(tweet.author, tweet.text, tweet.createdAt);
        return (
          <View style={styles.original}>
            <Text style={styles.headerLine}>{header}</Text>
            <Text style={styles.bodyLine}>{body}</Text>
          </View>
        );
      })()}
      <TextInput
        style={styles.input}
        placeholder='Tu comentario'
        multiline
        value={comment}
        onChangeText={setComment}
      />
      <TouchableOpacity style={[styles.btn, sending ? styles.disabled : styles.primary]} disabled={sending} onPress={postComment}>
        <Text style={styles.btnText}>{sending ? 'Enviando...' : 'Comentar'}</Text>
      </TouchableOpacity>
      <ScrollView style={styles.comments}>
        {tweet.comments?.length ? tweet.comments.map(c => (
          <View key={c._id} style={styles.comment}> 
            <View style={styles.commentHeader}> 
              <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { username: c.author?.username })}>
                <Text style={styles.commentAuthor}>@{c.author?.username}</Text>
              </TouchableOpacity>
              <Text style={styles.date}>{new Date(c.createdAt).toLocaleDateString('es-ES')}</Text>
            </View>
            <Text style={styles.commentText}>{c.text}</Text>
            {c.author?._id === tweet.author?._id && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteComment(c._id)}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        )) : <Text style={styles.empty}>Sin comentarios todavía</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffff", 
    padding: 16 
  },

  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 14,
    color: "#1a1a1a",
  },

  original: { 
    backgroundColor: "#f6eff5", // Suave tono morado claro
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 14 
  },

  headerLine: { 
    fontWeight: "700", 
    fontSize: 14, 
    color: "#3a0035" // Texto oscuro con matiz morado
  },

  bodyLine: { 
    marginTop: 8, 
    fontSize: 15, 
    color: "#1a1a1a", 
    lineHeight: 20, 
    marginBottom: 6 
  },

  input: { 
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#d8b4d5", // Borde morado claro
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 14,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#1a1a1a",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  btn: { 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: "center", 
    marginBottom: 16,
    shadowColor: "#8e1f7f",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  primary: { 
    backgroundColor: "#8e1f7f", // Primary
  },

  disabled: { 
    backgroundColor: "#b845a8", // Primary Light suavizado
    opacity: 0.5,
  },

  btnText: { 
    color: "#ffffff", 
    fontWeight: "700", 
    fontSize: 15 
  },

  comments: { 
    flex: 1 
  },

  comment: { 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
  },

  commentHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 4 
  },

  commentAuthor: { 
    fontWeight: "700", 
    color: "#8e1f7f" // Ahora combina con la identidad visual
  },

  date: { 
    fontSize: 12, 
    color: "#777" 
  },

  commentText: { 
    color: "#1a1a1a", 
    marginBottom: 6,
    fontSize: 14
  },

  deleteBtn: { 
    alignSelf: "flex-start", 
    backgroundColor: "#ffebf0", // Rosa suave elegante
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },

  deleteText: { 
    color: "#d80000", 
    fontWeight: "700", 
    fontSize: 12 
  },

  empty: { 
    textAlign: "center", 
    marginTop: 20, 
    color: "#777",
    fontSize: 14,
  }
});
