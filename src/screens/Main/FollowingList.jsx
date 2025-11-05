import React from "react";

export default function FollowingList() {
  const following = ["Sofía", "Mateo", "Daniel"];

  return (
    <div className="container">
      <h2>Siguiendo</h2>
      {following.map(name => (
        <div key={name} className="follow-item">
          <span>{name}</span>
          <button>Dejar de seguir</button>
        </div>
      ))}
    </div>
  );
}
