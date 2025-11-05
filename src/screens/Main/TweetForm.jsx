import React from "react";

export default function TweetForm() {
  return (
    <div className="container">
      <h2>Publicar Tweet</h2>
      <textarea placeholder="¿Qué está pasando?" rows="4"></textarea>
      <button>Publicar</button>
    </div>
  );
}
