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
import { getFollowers, followUser, unfollowUser } from "../../api/api";
import Header from "../../components/Header";

export default function FollowersScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // load followers data from server
  const loadFollowers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFollowers(user.username);
      setFollowers(data.followers || []);
    } catch (error) {
      console.error("Error loading followers:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // load followers when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFollowers();
    }, [loadFollowers])
  );

  // follow or unfollow user
  const handleFollowToggle = async (followerUser) => {
    try {
      // check if already following
      const isFollowing = followers.some(f => f._id === followerUser._id && f.isFollowing);
      
      if (isFollowing) {
        await unfollowUser(followerUser._id, user.id);
      } else {
        await followUser(followerUser._id, user.id);
      }
      
      // reload list
      loadFollowers();
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Followers" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Followers" />
      {followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No followers yet</Text>
        </View>
      ) : (
        <FlatList
          data={followers}
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
                style={[styles.button, item.isFollowing && styles.followingButton]}
                onPress={() => handleFollowToggle(item)}
              >
                <Text style={[styles.buttonText, item.isFollowing && styles.followingText]}>
                  {item.isFollowing ? "Following" : "Follow"}
                </Text>
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
    backgroundColor: "#F5F5F5", // Gray100
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
    color: "#8A8A8A", // Gray500
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DCDCDC", // Gray300
    backgroundColor: "#FFFFFF",
  },

  userInfo: {
    flex: 1,
  },

  name: { 
    fontWeight: "700", 
    fontSize: 16,
    color: "#1A1A1A", // Dark Text
  },

  username: { 
    color: "#8A8A8A", // Gray500
    fontSize: 14,
    marginTop: 2,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#8E1F7F", // Primary color
  },

  followingButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCDCDC", // Gray300
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  followingText: {
    color: "#1A1A1A",
  },
});

