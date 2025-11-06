import React, { useState } from "react";
import { View, Text, FlatList, Button, StyleSheet } from "react-native";

export default function FollowingScreen() {
  const [following, setFollowing] = useState([
    { id: "1", name: "Camilo", username: "camilocode" },
    { id: "2", name: "Diana", username: "dianadev" },
  ]);

  const handleUnfollow = (id) => {
    setFollowing((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={following}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <Button
              title="Dejar de seguir"
              color="gray"
              onPress={() => handleUnfollow(item.id)}
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
