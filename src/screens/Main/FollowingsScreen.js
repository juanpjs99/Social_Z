import React, { useState, useContext, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { getFollowing, unfollowUser } from "../../api/api";
import Header from "../../components/Header";

export default function FollowingScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // load following data from server
  const loadFollowing = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFollowing(user.username);
      setFollowing(data.following || []);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // load following list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFollowing();
    }, [loadFollowing])
  );

  // unfollow user
  const handleUnfollow = async (targetUser) => {
    try {
      await unfollowUser(targetUser._id, user.id);
      // reload list
      loadFollowing();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Following" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Following" />
      {following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not following anyone yet</Text>
        </View>
      ) : (
        <FlatList
          data={following}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity 
                style={styles.userInfo}
                onPress={() => navigation.navigate('UserProfile', { username: item.username })}
              >
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleUnfollow(item)}
              >
                <Text style={styles.buttonText}>Unfollow</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#657786",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  userInfo: {
    flex: 1,
  },
  name: { 
    fontWeight: "700", 
    fontSize: 16,
    color: "#14171A",
  },
  username: { 
    color: "#657786",
    fontSize: 14,
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  buttonText: {
    color: "#14171A",
    fontWeight: "600",
    fontSize: 14,
  },
});
