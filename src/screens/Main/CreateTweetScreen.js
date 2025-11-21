import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearTweet } from '../../api/api';
import { showMessage } from '../../utils/notify';

export default function CreateTweetScreen({ navigation }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null); // { uri, base64, type }
  const [sending, setSending] = useState(false);

  const pickImage = async () => {
    try {
      if (Platform.OS === 'android') {
        const api33 = parseInt(Platform.Version, 10) >= 33;
        const permission = api33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showMessage('Permiso denegado', 'Se requiere permiso para acceder a tus imágenes', { toast: true });
          return;
        }
      }
      const res = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.7 });
      if (!res || res.didCancel) return;
      if (res.errorCode) {
  showMessage('Error', res.errorMessage || res.errorCode, { toast: true });
        return;
      }
      const asset = res.assets?.[0];
      if (asset) {
        setImage({ uri: asset.uri, base64: asset.base64, type: asset.type || 'image/jpeg' });
      }
    } catch (e) {
  showMessage('Error', 'No se pudo seleccionar la imagen: ' + (e.message || e));
    }
  };

  const publicar = async () => {
    if (sending) return;
    if (!text.trim() && !image) {
  showMessage('Error', 'El tweet no puede estar vacío', { toast: true });
      return;
    }
    if (text.length > 280) {
  showMessage('Error', 'El tweet no puede exceder 280 caracteres', { toast: true });
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
  showMessage('Error', 'Debes iniciar sesión');
        return;
      }
      setSending(true);
      const imageData = image?.base64 ? `data:${image.type};base64,${image.base64}` : undefined;
      await crearTweet(userId, text, imageData);
      setText('');
      setImage(null);
  showMessage('Éxito', 'Tweet publicado correctamente', { toast: true });
      navigation.goBack();
    } catch (e) {
  showMessage('Error', e.response?.data?.message || e.message || 'No se pudo publicar');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Tweet</Text>
      <TextInput
        style={styles.input}
        placeholder='¿Qué está pasando?'
        multiline
        value={text}
        onChangeText={setText}
        maxLength={280}
      />
      <Text style={[styles.charCount, text.length > 280 && styles.charCountError]}>
        {text.length}/280
      </Text>
      {image && (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      )}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={image ? () => setImage(null) : pickImage}>
          <Text style={styles.btnText}>{image ? 'Quitar imagen' : 'Agregar imagen'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.publishBtn, sending ? styles.disabled : styles.primary]} disabled={sending} onPress={publicar}>
          <Image source={require('../../assets/logo.png')} style={styles.btnIcon} />
          <Text style={styles.btnText}>{sending ? 'Publicando...' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#ffffff" 
  },

  title: { 
    fontSize: 22, 
    fontWeight: "700",
    marginBottom: 14,
    color: "#1a1a1a",
  },

  input: { 
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#dcdcdc", // Gray300
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 10,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  charCount: { 
    fontSize: 13, 
    color: "#8a8a8a", // Gray500
    textAlign: "right",
    marginBottom: 12,
  },

  charCountError: { 
    color: "#E0245E", 
    fontWeight: "700" 
  },

  preview: { 
    width: "100%", 
    height: 200, 
    borderRadius: 12, 
    marginBottom: 14,
    backgroundColor: "#f5f5f5",
  },

  buttonsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 10 
  },

  btn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  publishBtn: { 
    flexDirection: "row" 
  },

  btnIcon: { 
    width: 22, 
    height: 22, 
    marginRight: 8, 
    resizeMode: "contain" 
  },

  /** ----- BUTTON COLORS  ----- **/

  primary: { 
    backgroundColor: "#8e1f7f", // Primary
    shadowColor: "#8e1f7f",
  },

  secondary: { 
    backgroundColor: "#4a4a4a", // Gray700
  },

  disabled: { 
    backgroundColor: "#b845a8", // Primary Light desaturado
    opacity: 0.5,
  },

  btnText: { 
    color: "#ffffff", 
    fontWeight: "700", 
    fontSize: 16,
  },
});

