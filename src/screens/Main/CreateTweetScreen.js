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
      />
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
  container: { flex:1, padding:16, backgroundColor:'#fff' },
  title: { fontSize:20, fontWeight:'700', marginBottom:12 },
  input: { minHeight:120, borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, textAlignVertical:'top', marginBottom:12 },
  preview: { width:'100%', height:200, borderRadius:8, marginBottom:12 },
  buttonsRow: { flexDirection:'row', justifyContent:'space-between', gap:10 },
  btn: { flex:1, paddingVertical:14, borderRadius:8, alignItems:'center', justifyContent:'center' },
  publishBtn: { flexDirection:'row' },
  btnIcon:{ width:22, height:22, marginRight:8, resizeMode:'contain' },
  primary: { backgroundColor:'#1DA1F2' },
  secondary: { backgroundColor:'#555' },
  disabled: { backgroundColor:'#999' },
  btnText: { color:'#fff', fontWeight:'600' }
});
