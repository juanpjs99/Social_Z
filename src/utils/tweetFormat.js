// Utilidad para construir el formato solicitado por la profesora
// --------------------------------------------------------------
// --------------------------------------------------------------
// Nombre completo, @usuario - Fecha y hora de publicación
// Cuerpo del mensaje
// --------------------------------------------------------------

export function formatTweet(author, text, createdAt) {
  // Si no existe fullName, simplemente mostramos @usuario
  const fullName = author?.fullName ? author.fullName : null;
  const username = author?.username ? `@${author.username}` : '@usuario';
  const date = createdAt ? new Date(createdAt) : new Date();
  // Formato DD/MM/YYYY HH:mm
  const fecha = date.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
  const hora = date.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
  const header = fullName ? `${fullName}, ${username} - ${fecha} ${hora}` : `${username} - ${fecha} ${hora}`;
  return {
    header,
    body: text || '',
  };
}
