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
import { launchImageLibrary } from "react-native-image-picker";
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
      const options = {
        mediaType: "photo",
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.5,
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
          Alert.alert("Error", "Failed to pick image");
        } else if (response.assets && response.assets[0].base64) {
          // save as base64 with prefix
          const base64Image = `data:image/jpeg;base64,${response.assets[0].base64}`;
          setProfilePicture(base64Image);
        }
      });
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
    backgroundColor: "#ffffff",
  },

  /** ---------------- HEADER ---------------- **/
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 14,

    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",

    // Sombra suave y elegante
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },

  saveButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8e1f7f", // Primary
  },

  /** ---------------- FOTO DE PORTADA ---------------- **/
  coverPhoto: {
    width: "100%",
    height: 130,
    backgroundColor: "#b845a8", // Primary Light
  },

  /** ---------------- FOTO DE PERFIL ---------------- **/
  profilePicSection: {
    alignItems: "center",
    marginTop: -45,
    marginBottom: 25,
  },

  profilePicContainer: {
    position: "relative",
  },

  profilePic: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
  },

  defaultPic: {
    backgroundColor: "#dcdcdc",
    justifyContent: "center",
    alignItems: "center",
  },

  defaultPicText: {
    fontSize: 38,
    fontWeight: "700",
    color: "#ffffff",
  },

  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#8e1f7f",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",

    shadowColor: "#8e1f7f",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  /** ---------------- FORMULARIO ---------------- **/
  form: {
    paddingHorizontal: 18,
  },

  inputGroup: {
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a4a4a",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  bioInput: {
    height: 110,
    textAlignVertical: "top",
  },

  disabledInput: {
    backgroundColor: "#f2f2f2",
    color: "#8a8a8a",
  },

  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#8a8a8a",
    marginTop: 4,
  },

  helperText: {
    fontSize: 12,
    color: "#8a8a8a",
    marginTop: 4,
  },
});

