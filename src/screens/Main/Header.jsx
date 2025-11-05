import React from "react";

export default function Header({ username, onLogout }) {
  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#1c1c1c",
      padding: "10px 20px",
      borderBottom: "1px solid #2a2a2a"
    }}>
      <h3 style={{ color: "#a855f7" }}>MiniTwitter</h3>
      <div>
        <span style={{ marginRight: "1rem" }}>@{username}</span>
        <button onClick={onLogout} style={{ width: "auto" }}>Cerrar sesión</button>
      </div>
    </header>
  );
}
