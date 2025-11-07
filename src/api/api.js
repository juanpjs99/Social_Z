import axios from "axios";

const API_URL = "http://10.0.2.2:4000/api";

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
    const res = await axios.post(`${API_URL}/tweets`, { userId, text, image });
    return res.data;
  } catch (error) {
    console.error("Error en crearTweet:", error.response?.data || error.message);
    throw error;
  }
};

export const obtenerTweets = async () => {
  try {
    const res = await axios.get(`${API_URL}/tweets`);
    return res.data;
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

// fetch user profile by username
export const getUserProfile = async (username) => {
  try {
    const res = await fetch(`${API_URL}api/users/profile/${username}`, {
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
    const res = await fetch(`${API_URL}api/users/profile/${userId}`, {
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
