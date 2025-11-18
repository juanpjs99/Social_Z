import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { agregarComentario, eliminarComentario } from "../api/api";
import { formatTweet } from '../utils/tweetFormat';

export default function CommentsModal({ visible, tweet, onClose, userId, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (comment.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await agregarComentario(tweet._id || tweet.id, userId, comment);
      setComment("");
      onCommentAdded?.();
      Alert.alert("Success", "Comment added");
    } catch (e) {
      Alert.alert("Error", "Could not add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
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
              await eliminarComentario(tweet._id || tweet.id, commentId);
              onCommentAdded?.();
            } catch (e) {
              Alert.alert("Error", "Could not delete comment");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 30 }} />
        </View>

        {(() => {
          const { header, body } = formatTweet(tweet.author, tweet.text, tweet.createdAt);
          return (
            <View style={styles.tweetOriginal}>
              <Text style={styles.headerLine}>{header}</Text>
              <Text style={styles.bodyLine}>{body}</Text>
            </View>
          );
        })()}

        <View style={styles.divider} />

        <View style={styles.form}>
          <TextInput
            placeholder="What do you think?"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
            style={styles.input}
          />
          <Button title={loading ? "Posting..." : "Comment"} onPress={handleAdd} disabled={loading} color="#1DA1F2" />
        </View>

        <View style={styles.divider} />

        <ScrollView style={styles.commentsList}>
          {tweet.comments && tweet.comments.length > 0 ? (
            tweet.comments.map((c) => (
              <View key={c._id} style={styles.comment}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>@{c.author?.username}</Text>
                  <Text style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString("en-US")}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
                {userId === c.author?._id && (
                  <TouchableOpacity onPress={() => handleDelete(c._id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.empty}> 
              <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  closeBtn: { fontSize: 24, fontWeight: "bold", color: "#1DA1F2", padding: 10 },
  tweetOriginal: { padding: 15, backgroundColor: "#f9f9f9", borderLeftWidth: 4, borderLeftColor: "#1DA1F2" },
  headerLine:{ fontWeight:'600', fontSize:13, color:'#222' },
  bodyLine:{ marginTop:8, fontSize:14, color:'#000', lineHeight:20, marginBottom:6 },
  divider: { height: 1, backgroundColor: "#eee" },
  form: { padding: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14, color: "#000", maxHeight: 100 },
  commentBtn: { alignSelf: 'stretch', backgroundColor: '#1DA1F2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  commentBtnDisabled: { backgroundColor: '#8abce0' },
  commentBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  commentsList: { flex: 1, paddingHorizontal: 15 },
  comment: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  commentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  commentAuthor: { fontWeight: "bold", fontSize: 14, color: "#1DA1F2" },
  commentDate: { fontSize: 12, color: "#999" },
  commentText: { fontSize: 14, color: "#333", lineHeight: 18, marginBottom: 8 },
  deleteBtn: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 8, backgroundColor: "#ffe0e0", borderRadius: 4, marginTop: 8 },
  deleteBtnText: { fontSize: 12, color: "#ff4444", fontWeight: "bold" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 30 },
    emptyText: { fontSize: 16, color: "#999", textAlign: "center" }, // removed commentBtn styles after revert
});
