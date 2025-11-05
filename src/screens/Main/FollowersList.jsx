import React from "react";

export default function FollowersList() {
  const followers = ["Andrés", "Carla", "Tatiana", "Luis"];

  return (
    <div className="container">
      <h2>Seguidores</h2>
      {followers.map(name => (
        <div key={name} className="follow-item">
          <span>{name}</span>
          <button>Seguir</button>
        </div>
      ))}
    </div>
  );
}
