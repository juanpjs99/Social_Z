import axios from "axios";
import { Platform } from 'react-native';

// Nota: cuando pruebas en el emulador de Android usa 10.0.2.2 para llegar a localhost.
// Si pruebas en un dispositivo físico debes usar la IP LAN de tu máquina, por ejemplo:
// const API_URL = 'http://192.168.1.10:5000/api'
const API_URL = "http://10.0.2.2:5000/api";
const SERVER_BASE = API_URL.replace('/api', '');

// Usuarios
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/users/register`, data);
    return res.data;
  } catch (error) {
    console.error("Error en registerUser:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/users/login`, data);
    return res.data;
  } catch (error) {
    console.error("Error en loginUser:", error.response?.data || error.message);
    throw error;
  }
};

// Tweets
export const crearTweet = async (userId, text, image) => {
  try {
    // Validar inputs básicos
    if (!userId) {
      throw new Error('userId es requerido');
    }
    if (!text || text.trim() === '') {
      throw new Error('El texto del tweet no puede estar vacío');
    }

    // Si image es un objeto con uri => enviar FormData (multipart)
    if (image && image.uri) {
      const form = new FormData();
      form.append('userId', String(userId)); // Asegurar que es string
      form.append('text', text);

      // Preparar archivo para RN
      const uri = image.uri;
      const filename = uri.split('/').pop();
      const type = image.type || 'image/jpeg';

      // Para React Native, debemos enviar el objeto completo
      form.append('image', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: type,
        name: filename
      });

      console.log('Enviando tweet con imagen:', { userId, text, filename });

      // Para FormData en React Native dejamos que axios gestione el Content-Type
      const res = await axios.post(`${API_URL}/tweets`, form, {
        headers: {
          Accept: 'application/json',
          // No establecer Content-Type manualmente en React Native, axios/FormData lo maneja
        },
        timeout: 20000,
      });
      return res.data;
    }

    // Si no hay imagen, enviar JSON simple
    console.log('Enviando tweet sin imagen:', { userId, text });
    const res = await axios.post(`${API_URL}/tweets`, { 
      userId: String(userId), 
      text, 
      image: image || '' 
    });
    return res.data;
  } catch (error) {
    // Mejorar logging para poder depurar Network Error:
    console.error('❌ Error en crearTweet - message:', error.message);
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('❌ Error en crearTweet - response status:', error.response.status);
      console.error('❌ Error en crearTweet - response data:', error.response.data);
    } else if (error.request) {
      // La petición fue enviada pero no hubo respuesta (Network Error típicamente)
      console.error('❌ Error en crearTweet - request made but no response:', error.request);
    } else {
      // Otro error
      console.error('❌ Error en crearTweet - unexpected:', error);
    }
    throw error;
  }
};

export const obtenerTweets = async () => {
  try {
    const res = await axios.get(`${API_URL}/tweets`);
    // Normalizar URLs de imagen: si viene como "/uploads/.." lo convertimos a URL completa
    if (Array.isArray(res.data)) {
      const normalized = res.data.map(t => {
        const img = t.image;
        if (img && typeof img === 'string' && img.startsWith('/uploads')) {
          return { ...t, image: `${SERVER_BASE}${img}` };
        }
        return t;
      });
      return normalized;
    }
    return res.data;
  } catch (error) {
    console.error("Error en obtenerTweets:", error.response?.data || error.message);
    throw error;
  }
};

export const likeTweet = async (tweetId, userId) => {
  try {
    const res = await axios.post(`${API_URL}/tweets/${tweetId}/like`, { userId });
    return res.data;
  } catch (error) {
    console.error("Error en likeTweet:", error.response?.data || error.message);
    throw error;
  }
};

export const agregarComentario = async (tweetId, userId, text) => {
  try {
    const res = await axios.post(`${API_URL}/tweets/${tweetId}/comments`, { userId, text });
    return res.data;
  } catch (error) {
    console.error("Error en agregarComentario:", error.response?.data || error.message);
    throw error;
  }
};

export const eliminarComentario = async (tweetId, commentId) => {
  try {
    const res = await axios.delete(`${API_URL}/tweets/${tweetId}/comments/${commentId}`);
    return res.data;
  } catch (error) {
    console.error("Error en eliminarComentario:", error.response?.data || error.message);
    throw error;
  }
};

export const eliminarTweet = async (tweetId) => {
  try {
    const res = await axios.delete(`${API_URL}/tweets/${tweetId}`);
    return res.data;
  } catch (error) {
    console.error("Error en eliminarTweet:", error.response?.data || error.message);
    throw error;
  }
};
