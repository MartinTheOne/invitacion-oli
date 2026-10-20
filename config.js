/* =================================================================
   DATOS DE LA INVITACIÓN
   Edita solo este archivo: la invitación (index.html) lee todo de aquí.
   Ojo: la vista previa al compartir el enlace está escrita en index.html
   (etiquetas og:), porque WhatsApp no lee este archivo.
   ================================================================= */
window.CUMPLE = {
  nombre: 'Olivia',

  // Fecha y hora de la fiesta → 'AAAA-MM-DDTHH:MM' (hora local)
  fecha: '2026-11-08T13:00',
  // Cómo quieres que se lea la hora. Vacío = '13:00 hrs'. Ej.: '1:00 p. m.'
  horaTexto: '13:00 hs',
  // Duración aproximada en horas (para el botón «Agendar»)
  duracionHoras: 4,

  lugar: {
    nombre: 'Shadia Eventos',
    direccion: 'Batalla de Ayacucho 1397, San Miguel de Tucumán',
    // Opcional: pega aquí el enlace de Google Maps. Si lo dejas vacío se busca la dirección.
    mapa: 'https://www.google.com/maps?ll=-26.848913,-65.214066&z=15&t=m&hl=es-US&gl=US&mapclient=embed&cid=10743076616302193039'
  },

  // WhatsApp donde llegan las confirmaciones: código de país + número, sin espacios ni '+'.
  // Ej. para Tucumán: '549381XXXXXXX'. Si lo dejas vacío, WhatsApp pedirá elegir el contacto.
  whatsapp: '5493813418145',

  mensaje: 'Hace un año llegué para llenar sus vidas de amor y sonrisas. ¡Quiero que me acompañes a celebrar mi primer añito!',
  nota: 'Tu presencia es mi mejor regalo',
  firma: 'Con amor, Olivia y sus papás',

  // Fotos: guárdalas en la carpeta /fotos con estos nombres (o cambia las rutas).
  // Si una foto no existe se muestra un recuadro decorado con el emoji.
  fotoPortada: 'fotos/portada.jpeg',
  // Va debajo de la portada. Déjala vacía ('') para ocultar ese espacio.
  fotoSecundaria: 'fotos/secundaria.jpeg',
  // Cada foto se muestra como «Mes 0», «Mes 1»…
  meses: [
    { foto: 'fotos/0.jpeg',  emoji: '🍼' },
    { foto: 'fotos/1.jpeg',  emoji: '👶' },
    { foto: 'fotos/2.jpeg',  emoji: '😊' },
    { foto: 'fotos/3.jpeg',  emoji: '🧸' },
    { foto: 'fotos/4.jpeg',  emoji: '🎀' },
    { foto: 'fotos/5.jpeg',  emoji: '🌸' },
    { foto: 'fotos/6.jpeg',  emoji: '🥄' },
    { foto: 'fotos/7.jpeg',  emoji: '🐣' },
    { foto: 'fotos/8.jpeg',  emoji: '🦋' },
    { foto: 'fotos/9.jpeg',  emoji: '🌙' },
    { foto: 'fotos/10.jpeg', emoji: '⭐' },
    { foto: 'fotos/11.jpeg', emoji: '🎂' }
  ],

  // Música de fondo: ruta a un archivo .mp3 (ej.: 'musica.mp3'). Vacío = sin música.
  musica: ''
};
