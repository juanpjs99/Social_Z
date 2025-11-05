export const API_URL = "http:// 192.168.56.1:4000/api"; // <-- cambia 192.168.1.10 por tu IP local

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Error en registerUser:", error);
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Error en loginUser:", error);
  }
};
