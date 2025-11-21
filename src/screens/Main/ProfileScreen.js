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
import { getUserProfile, getUserTweets } from "../../api/api";
import Header from "../../components/Header";

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTweets, setLoadingTweets] = useState(false);

  // load profile data and tweets
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (user && user.username) {
        const data = await getUserProfile(user.username);
        setProfileData(data);
        
        // load user tweets
        setLoadingTweets(true);
        const userTweets = await getUserTweets(user.username);
        setTweets(userTweets);
        setLoadingTweets(false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setLoadingTweets(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // reload profile every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

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
      <Header title="Profile" />
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

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile", { profileData })}
            >
              <Ionicons name="create-outline" size={18} color="#14171A" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Bio */}
          {profileData?.bio && (
            <Text style={styles.bio}>{profileData.bio}</Text>
          )}

          {/* Stats - Followers and Following */}
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => navigation.navigate('Following')}
            >
              <Text style={styles.statNumber}>{profileData?.followingCount || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.stat}
              onPress={() => navigation.navigate('Followers')}
            >
              <Text style={styles.statNumber}>{profileData?.followersCount || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
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
    backgroundColor: "#B845A8", // PrimaryLight más elegante
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
    borderColor: "#F5F5F5", // Fondo suave
  },

  defaultPic: {
    backgroundColor: "#8E1F7F", // Primary
    justifyContent: "center",
    alignItems: "center",
  },

  defaultPicText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
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

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DCDCDC", // Gray300
    borderRadius: 20,
    gap: 6,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
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
    borderBottomColor: "#DCDCDC",
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
    color: "#8A8A8A",
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

