import axios from "axios";

// Ajustar puerto al backend actual (5000)
const API_URL = "http://10.0.2.2:5000/api";

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
export const crearTweet = async (userId, text, imageData) => {
  // Versión revertida: enviamos base64 (o vacío) en JSON en lugar de multipart
  try {
    const payload = { userId, text };
    if (imageData) payload.image = imageData; // e.g. data:image/jpeg;base64,XXXX
    const res = await axios.post(`${API_URL}/tweets`, payload);
    return res.data;
  } catch (error) {
    console.error("Error en crearTweet:", error.response?.data || error.message);
    throw error;
  }
};

export const obtenerTweets = async () => {
  try {
    const res = await axios.get(`${API_URL}/tweets`);
    return (res.data || []).map(t => {
      if (t.image && typeof t.image === 'string' && t.image.startsWith('/uploads')) {
        return { ...t, image: `http://10.0.2.2:5000${t.image}` };
      }
      return t;
    });
  } catch (error) {
    console.error("Error en obtenerTweets:", error.response?.data || error.message);
    throw error;
  }
};

export const eliminarTweet = async (tweetId, userId) => {
  try {
    const res = await axios.delete(`${API_URL}/tweets/${tweetId}`, {
      data: { userId }
    });
    return res.data;
  } catch (error) {
    console.error("Error en eliminarTweet:", error.response?.data || error.message);
    throw error;
  }
};

// Like/unlike tweet
export const likeTweet = async (tweetId, userId) => {
  try {
    const res = await axios.post(`${API_URL}/tweets/${tweetId}/like`, { userId });
    return res.data;
  } catch (error) {
    console.error('Error en likeTweet:', error.response?.data || error.message);
    throw error;
  }
};

// Agregar comentario
export const agregarComentario = async (tweetId, userId, text) => {
  try {
    const res = await axios.post(`${API_URL}/tweets/${tweetId}/comments`, { userId, text });
    return res.data;
  } catch (error) {
    console.error('Error en agregarComentario:', error.response?.data || error.message);
    throw error;
  }
};

// Eliminar comentario
export const eliminarComentario = async (tweetId, commentId) => {
  try {
    const res = await axios.delete(`${API_URL}/tweets/${tweetId}/comments/${commentId}`);
    return res.data;
  } catch (error) {
    console.error('Error en eliminarComentario:', error.response?.data || error.message);
    throw error;
  }
};

// fetch user profile by username
export const getUserProfile = async (username) => {
  try {
    const res = await fetch(`${API_URL}/users/profile/${username}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// update user profile
export const updateUserProfile = async (userId, data) => {
  try {
    const res = await fetch(`${API_URL}/users/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Seguir usuario
export const followUser = async (targetUserId, userId) => {
  try {
    const res = await axios.post(`${API_URL}/users/${targetUserId}/follow`, { userId });
    return res.data;
  } catch (error) {
    console.error('Error en followUser:', error.response?.data || error.message);
    throw error;
  }
};

// Dejar de seguir (por si se necesita luego)
export const unfollowUser = async (targetUserId, userId) => {
  try {
    const res = await axios.post(`${API_URL}/users/${targetUserId}/unfollow`, { userId });
    return res.data;
  } catch (error) {
    console.error('Error en unfollowUser:', error.response?.data || error.message);
    throw error;
  }
};
