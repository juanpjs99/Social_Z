import React, { useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";

export default function FollowersScreen() {
  const [followers, setFollowers] = useState([
    { id: "1", name: "Mateo", username: "devmateo", isFollowing: true },
    { id: "2", name: "Laura", username: "lauradev", isFollowing: false },
  ]);

  const handleFollow = (id) => {
    setFollowers((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, isFollowing: !f.isFollowing } : f
      )
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <Button
              title={item.isFollowing ? "Siguiendo" : "Seguir"}
              onPress={() => handleFollow(item.id)}
              color={item.isFollowing ? "gray" : "#1DA1F2"}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  name: { fontWeight: "700", fontSize: 16 },
  username: { color: "gray" },
});
