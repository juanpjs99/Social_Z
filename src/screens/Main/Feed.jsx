import React from "react";

export default function Feed() {
  const feed = [
    { id: 1, user: "Tatiana", text: "Hola mundo 🌍" },
    { id: 2, user: "Luismi", text: "React + Java = 💜" },
  ];

  return (
    <div className="container">
      <h2>Feed</h2>
      {feed.map(f => (
        <div key={f.id} className="tweet">
          <p><strong>@{f.user}</strong></p>
          <p>{f.text}</p>
        </div>
      ))}
    </div>
  );
}
