import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../../context/AuthContext";
import { updateUserProfile } from "../../api/api";

export default function EditProfileScreen({ navigation, route }) {
  const { user, login } = useContext(AuthContext);
  const { profileData } = route.params || {};

  const [fullName, setFullName] = useState(profileData?.fullName || "");
  const [bio, setBio] = useState(profileData?.bio || "");
  const [profilePicture, setProfilePicture] = useState(profileData?.profilePicture || "");
  const [loading, setLoading] = useState(false);

  // pick image from gallery
  const pickImage = async () => {
    try {
      // request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need gallery access to change your profile picture");
        return;
      }

      // open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // square
        quality: 0.5, // compress to save space
        base64: true, // get base64 string
      });

      if (!result.canceled && result.assets[0].base64) {
        // save as base64 with prefix
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfilePicture(base64Image);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // save changes
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        fullName: fullName.trim(),
        bio: bio.trim(),
        profilePicture: profilePicture,
      };

      await updateUserProfile(profileData.id, updateData);

      // update context with new name
      await login({
        ...user,
        fullName: fullName.trim(),
      });

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#14171A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#1DA1F2" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Cover Photo Placeholder */}
      <View style={styles.coverPhoto} />

      {/* Profile Picture */}
      <View style={styles.profilePicSection}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.defaultPic]}>
              <Text style={styles.defaultPicText}>
                {fullName.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor="#AAB8C2"
            maxLength={50}
          />
        </View>

        {/* Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#AAB8C2"
            multiline
            maxLength={160}
          />
          <Text style={styles.charCount}>{bio.length}/160</Text>
        </View>

        {/* Username (readonly) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={`@${profileData?.username || ""}`}
            editable={false}
          />
          <Text style={styles.helperText}>Username cannot be changed</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14171A",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1DA1F2",
  },
  coverPhoto: {
    width: "100%",
    height: 120,
    backgroundColor: "#1DA1F2",
  },
  profilePicSection: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
  },
  profilePicContainer: {
    position: "relative",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  defaultPic: {
    backgroundColor: "#AAB8C2",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultPicText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1DA1F2",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  form: {
    paddingHorizontal: 15,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#657786",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e8ed",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#14171A",
    backgroundColor: "#fff",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#f7f9fa",
    color: "#657786",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#AAB8C2",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#AAB8C2",
    marginTop: 4,
  },
});
