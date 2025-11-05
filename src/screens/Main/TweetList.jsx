import React from "react";

export default function TweetList() {
  const tweets = [
    { id: 1, user: "Tatiana", text: "Aprendiendo React 💜", likes: 12 },
    { id: 2, user: "Luismi", text: "Maquetando el clon de Twitter 😎", likes: 8 },
  ];

  return (
    <div className="container">
      <h2>Tweets</h2>
      {tweets.map(t => (
        <div className="tweet" key={t.id}>
          <p><strong>@{t.user}</strong></p>
          <p>{t.text}</p>
          <small>{t.likes} Me gusta ❤️</small>
        </div>
      ))}
    </div>
  );
}
