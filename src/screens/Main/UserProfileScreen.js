import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../../context/AuthContext";
import { getUserProfile, getUserTweets, followUser, unfollowUser } from "../../api/api";
import Header from "../../components/Header";

export default function UserProfileScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { username } = route.params;
  const [profileData, setProfileData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // load user profile and tweets
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserProfile(username, user.id);
      setProfileData(data);
      
      // set isFollowing from backend response
      setIsFollowing(data.isFollowing || false);
      
      // load user tweets
      setLoadingTweets(true);
      const userTweets = await getUserTweets(username);
      setTweets(userTweets);
      setLoadingTweets(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setLoadingTweets(false);
    } finally {
      setLoading(false);
    }
  }, [username, user.id]);

  // reload profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // handle follow/unfollow
  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await unfollowUser(profileData.id, user.id);
      } else {
        await followUser(profileData.id, user.id);
      }
      // reload profile to update counts and follow status
      await loadProfile();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  // render each tweet
  const renderTweet = ({ item }) => (
    <TouchableOpacity 
      style={styles.tweetCard}
      onPress={() => navigation.navigate('Comments', { tweet: item, refreshHome: loadProfile })}
    >
      <View style={styles.tweetHeader}>
        <Text style={styles.tweetAuthor}>@{item.author?.username}</Text>
        <Text style={styles.tweetDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.tweetText}>{item.text}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.tweetImage} />
      )}
      <View style={styles.tweetStats}>
        <View style={styles.statItem}>
          <Ionicons name="heart" size={18} color="#e0245e" />
          <Text style={styles.statText}>{item.likes?.length || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#1DA1F2" />
          <Text style={styles.statText}>{item.comments?.length || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title={`@${username}`} />
      <ScrollView style={styles.scrollContent}>
        {/* Header with cover and profile pic */}
        <View style={styles.header}>
          <View style={styles.coverPhoto} />
          <View style={styles.profilePicContainer}>
            {profileData?.profilePicture ? (
              <Image
                source={{ uri: profileData.profilePicture }}
                style={styles.profilePic}
              />
            ) : (
              <View style={[styles.profilePic, styles.defaultPic]}>
                <Text style={styles.defaultPicText}>
                  {profileData?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <View>
              <Text style={styles.fullName}>{profileData?.fullName || "User"}</Text>
              <Text style={styles.username}>@{profileData?.username || "username"}</Text>
            </View>

            {/* Follow button - only show if not own profile */}
            {username !== user.username && (
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? "#14171A" : "#fff"} />
                ) : (
                  <Text style={[styles.followButtonText, isFollowing && styles.followingText]}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Bio */}
          {profileData?.bio && (
            <Text style={styles.bio}>{profileData.bio}</Text>
          )}

          {/* Stats - Followers and Following */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profileData?.followingCount || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profileData?.followersCount || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Tweets</Text>
          </View>
          <View style={styles.tab}>
            <Text style={styles.tabText}>Retweets</Text>
          </View>
        </View>

        {/* Tweets list */}
        {loadingTweets ? (
          <View style={styles.tweetsContainer}>
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        ) : tweets.length === 0 ? (
          <View style={styles.tweetsContainer}>
            <Text style={styles.placeholderText}>No tweets yet</Text>
          </View>
        ) : (
          <FlatList
            data={tweets}
            keyExtractor={(item) => item._id}
            renderItem={renderTweet}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Gray100
  },

  scrollContent: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    position: "relative",
  },

  coverPhoto: {
    width: "100%",
    height: 120,
    backgroundColor: "#B845A8", // PrimaryLight
  },

  profilePicContainer: {
    position: "absolute",
    bottom: -40,
    left: 15,
  },

  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#F5F5F5", // Gray100
  },

  defaultPic: {
    backgroundColor: "#8E1F7F", // Primary
    justifyContent: "center",
    alignItems: "center",
  },

  defaultPicText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  infoSection: {
    marginTop: 50,
    paddingHorizontal: 15,
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  fullName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A", // DarkText
  },

  username: {
    fontSize: 15,
    color: "#8A8A8A", // Gray500
    marginTop: 2,
  },

  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#8E1F7F", // Primary
  },

  followingButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCDCDC", // Gray300
  },

  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  followingText: {
    color: "#1A1A1A", // DarkText
  },

  bio: {
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 15,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
  },

  stat: {
    flexDirection: "row",
    marginRight: 20,
    alignItems: "baseline",
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginRight: 4,
  },

  statLabel: {
    fontSize: 15,
    color: "#8A8A8A", // Gray500
  },

  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#DCDCDC", // Gray300
    marginTop: 10,
  },

  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },

  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#8E1F7F", // Primary
  },

  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8A8A8A", // Gray500
  },

  activeTabText: {
    color: "#8E1F7F", // Primary
  },

  tweetsContainer: {
    padding: 20,
    alignItems: "center",
  },

  placeholderText: {
    color: "#8A8A8A",
    fontSize: 15,
  },

  tweetCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DCDCDC",
  },

  tweetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  tweetAuthor: {
    fontWeight: "600",
    color: "#1A1A1A",
  },

  tweetDate: {
    fontSize: 12,
    color: "#8A8A8A",
  },

  tweetText: {
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 10,
    lineHeight: 20,
  },

  tweetImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },

  tweetStats: {
    flexDirection: "row",
    gap: 20,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 13,
    color: "#8A8A8A",
  },
});
