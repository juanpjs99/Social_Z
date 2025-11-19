import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../../context/AuthContext";
import { getUserProfile } from "../../api/api";
import Header from "../../components/Header";

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // load profile data when screen opens
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Loading profile for user:", user);
      if (user && user.username) {
        console.log("Fetching profile for username:", user.username);
        const data = await getUserProfile(user.username);
        console.log("Profile data received:", data);
        setProfileData(data);
      } else {
        console.log("No user or username found in context");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
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

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView style={styles.scrollContent}>
        {/* Header with cover and profile pic */}
        <View style={styles.header}>
          <View style={styles.coverPhoto}>
            {/* simple gradient background as cover */}
          </View>

          {/* Profile Picture */}
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

          <View style={styles.buttonsRow}>
            {/* Edit Profile button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate("EditProfile", { profileData })
              }
            >
              <Ionicons name="create-outline" size={18} color="#14171A" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
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

      {/* Tabs Section - for now just a placeholder */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Tweets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Retweets</Text>
        </TouchableOpacity>
      </View>

      {/* Tweets list will go here - placeholder for now */}
      <View style={styles.tweetsContainer}>
        <Text style={styles.placeholderText}>Your tweets will appear here</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    backgroundColor: "#1DA1F2",
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
    borderColor: "#fff",
  },
  defaultPic: {
    backgroundColor: "#AAB8C2",
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
    color: "#14171A",
  },
  username: {
    fontSize: 15,
    color: "#657786",
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14171A",
  },
  logoutButton: {
    padding: 8,
  },
  bio: {
    fontSize: 15,
    color: "#14171A",
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
    color: "#14171A",
    marginRight: 4,
  },
  statLabel: {
    fontSize: 15,
    color: "#657786",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    marginTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#1DA1F2",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#657786",
  },
  activeTabText: {
    color: "#1DA1F2",
  },
  tweetsContainer: {
    padding: 20,
    alignItems: "center",
  },
  placeholderText: {
    color: "#AAB8C2",
    fontSize: 15,
  },
});
