const API_URL = "http://10.0.2.2:4000/";

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    console.log("Respuesta del backend:", json);
    return json;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    console.log("Respuesta del backend:", json);
    return json;
  } catch (error) {
    console.error("Error en loginUser:", error);
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
