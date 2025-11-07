// src/Main/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";

export default function HomeScreen({ navigation }) {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    setTweets([
      { id: "1", user: "jpablo", content: "Mi primer tweet 🚀" },
      { id: "2", user: "mateo", content: "Clon de X en marcha 👨‍💻" },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Home" />

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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tweetCard}>
            <Text style={styles.user}>@{item.user}</Text>
            <Text style={styles.tweet}>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  navButton: { alignItems: "center" },
  navText: { marginTop: 3, color: "#1DA1F2", fontSize: 13 },
  tweetCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  user: { fontWeight: "600", marginBottom: 4 },
  tweet: { fontSize: 15 },
});
