// Variables globales
let palabra = "";
let pista = "";
let progreso = [];
let letrasIncorrectas = [];
let intentosMaximos = 6;
let intentosRealizados = 0;
let puntos = 0;
let racha = 0;
let dificultad = "medio";
let categoria = "manual";
let pistasUsadas = 0;

// Banco de palabras por categoría
const bancoPalabras = {
  animales: [
    { palabra: "ELEFANTE", pista: "Es el animal terrestre más grande" },
    { palabra: "COCODRILO", pista: "Reptil que vive en ríos" },
    { palabra: "PINGÜINO", pista: "Ave que no vuela pero nada muy bien" },
    { palabra: "JIRAFA", pista: "El animal más alto del mundo" },
    { palabra: "TIGRE", pista: "Felino con rayas" }
  ],
  paises: [
    { palabra: "ARGENTINA", pista: "País del tango y el fútbol" },
    { palabra: "JAPÓN", pista: "País del sol naciente" },
    { palabra: "EGIPTO", pista: "Tierra de las pirámides" },
    { palabra: "AUSTRALIA", pista: "País continente" },
    { palabra: "BRASIL", pista: "País más grande de Sudamérica" }
  ],
  frutas: [
    { palabra: "MANGO", pista: "Fruta tropical de color amarillo o rojo" },
    { palabra: "FRAMBUESA", pista: "Pequeña fruta roja compuesta de drupas" },
    { palabra: "MELÓN", pista: "Fruta grande y jugosa de verano" },
    { palabra: "GRANADA", pista: "Fruta llena de semillas rojas" },
    { palabra: "CEREZA", pista: "Pequeña fruta roja con hueso" }
  ],
  deportes: [
    { palabra: "NATACIÓN", pista: "Deporte acuático" },
    { palabra: "BALONCESTO", pista: "Deporte con canasta y balón" },
    { palabra: "ESQUÍ", pista: "Deporte de invierno en la nieve" },
    { palabra: "TENIS", pista: "Deporte con raqueta y red" },
    { palabra: "GOLF", pista: "Deporte con palos y hoyos" }
  ]
};

// Referencias DOM
const progresoDiv = document.getElementById("progreso");
const incorrectasDiv = document.getElementById("incorrectas");
const intentosDiv = document.getElementById("intentos");
const pistaDiv = document.getElementById("pista");
const canvas = document.getElementById("ahorcado");
const ctx = canvas.getContext("2d");
const tecladoDiv = document.getElementById("teclado");
const efectosDiv = document.getElementById("efectos");
const puntosSpan = document.getElementById("puntos");
const rachaSpan = document.getElementById("racha");

// Elementos de configuración
const inputPalabra = document.getElementById("palabraSecreta");
const btnIniciar = document.getElementById("btn-iniciar");
const btnIniciarAleatorio = document.getElementById("btn-iniciar-aleatorio");
const divConfig = document.getElementById("configuracion");
const divJuego = document.getElementById("juego");
const divFinJuego = document.getElementById("fin-juego");
const selectDificultad = document.getElementById("dificultad");
const selectCategoria = document.getElementById("categoria");
const entradaManual = document.getElementById("entradaManual");
const botonCategoria = document.getElementById("botonCategoria");

// Elementos de fin de juego
const tituloFin = document.getElementById("titulo-fin");
const mensajeFin = document.getElementById("mensaje-fin");
const estadisticasFin = document.getElementById("estadisticas-fin");
const btnJugarNuevo = document.getElementById("btn-jugar-nuevo");

// Botones del juego
const btnPista = document.getElementById("btn-pista");
const btnReiniciar = document.getElementById("btn-reiniciar");

// --- Eventos de configuración ---
selectCategoria.addEventListener("change", () => {
  categoria = selectCategoria.value;
  if (categoria === "manual") {
    entradaManual.style.display = "block";
    botonCategoria.style.display = "none";
  } else {
    entradaManual.style.display = "none";
    botonCategoria.style.display = "block";
  }
});

// --- Inicializar juego ---
btnIniciar.addEventListener("click", () => {
  palabra = inputPalabra.value.toUpperCase();
  if (!palabra.match(/^[A-ZÑ]+$/)) {
    mostrarNotificacion("La palabra debe contener solo letras.", "error");
    return;
  }
  iniciarJuego(palabra, "");
});

btnIniciarAleatorio.addEventListener("click", () => {
  const palabrasCategoria = bancoPalabras[categoria];
  const indiceAleatorio = Math.floor(Math.random() * palabrasCategoria.length);
  const palabraSeleccionada = palabrasCategoria[indiceAleatorio];
  iniciarJuego(palabraSeleccionada.palabra, palabraSeleccionada.pista);
});

btnJugarNuevo.addEventListener("click", () => {
  divFinJuego.style.display = "none";
  divConfig.style.display = "block";
  limpiarCanvas();
});

btnReiniciar.addEventListener("click", () => {
  divJuego.style.display = "none";
  divConfig.style.display = "block";
  limpiarCanvas();
});

btnPista.addEventListener("click", () => {
  if (pista && pistasUsadas === 0) {
    pistaDiv.textContent = `💡 Pista: ${pista}`;
    puntos = Math.max(0, puntos - 5);
    actualizarPuntuacion();
    pistasUsadas++;
    btnPista.disabled = true;
    mostrarNotificacion("Has usado una pista. -5 puntos", "info");
  }
});

function iniciarJuego(palabraSecreta, pistaSecreta) {
  palabra = palabraSecreta;
  pista = pistaSecreta;
  dificultad = selectDificultad.value;
  
  // Configurar intentos según dificultad
  switch(dificultad) {
    case "facil":
      intentosMaximos = 6;
      break;
    case "medio":
      intentosMaximos = 5;
      break;
    case "dificil":
      intentosMaximos = 4;
      break;
  }
  
  progreso = Array(palabra.length).fill("_");
  letrasIncorrectas = [];
  intentosRealizados = 0;
  pistasUsadas = 0;
  
  divConfig.style.display = "none";
  divJuego.style.display = "block";
  
  crearTeclado();
  actualizarInterfaz();
  btnPista.disabled = false;
  if (!pista) btnPista.disabled = true;
}

// --- Funciones ---
function actualizarInterfaz() {
  progresoDiv.textContent = progreso.join(" ");
  incorrectasDiv.textContent = "❌ Letras incorrectas: " + letrasIncorrectas.join(", ");
  intentosDiv.textContent = `🔁 Intentos restantes: ${intentosMaximos - intentosRealizados}`;
  
  // Cambiar color según intentos restantes
  const intentosRestantes = intentosMaximos - intentosRealizados;
  if (intentosRestantes <= 2) {
    intentosDiv.style.color = "#e74c3c";
  } else if (intentosRestantes <= 4) {
    intentosDiv.style.color = "#f39c12";
  } else {
    intentosDiv.style.color = "#2ecc71";
  }
  
  dibujarAhorcado(intentosRealizados);
}

function procesarLetra(letra) {
  if (!letra.match(/[A-ZÑ]/)) {
    mostrarNotificacion("Por favor ingresa una letra válida.", "error");
    return;
  }

  if (progreso.includes(letra) || letrasIncorrectas.includes(letra)) {
    mostrarNotificacion("Ya intentaste esa letra.", "warning");
    return;
  }

  if (palabra.includes(letra)) {
    for (let i = 0; i < palabra.length; i++) {
      if (palabra[i] === letra) {
        progreso[i] = letra;
      }
    }
    // Animación de acierto
    crearEfectoAcierto();
    puntos += 10;
  } else {
    letrasIncorrectas.push(letra);
    intentosRealizados++;
    // Animación de error
    crearEfectoError();
  }

  actualizarInterfaz();
  actualizarPuntuacion();
  verificarFin();
}

function actualizarPuntuacion() {
  puntosSpan.textContent = `Puntos: ${puntos}`;
  rachaSpan.textContent = `Racha: ${racha}`;
}

function verificarFin() {
  if (!progreso.includes("_")) {
    // Ganó
    racha++;
    puntos += 50 * (dificultad === "facil" ? 1 : dificultad === "medio" ? 2 : 3);
    actualizarPuntuacion();
    
    setTimeout(() => {
      mostrarFinJuego(true);
      crearEfectoGanar();
    }, 500);
  } else if (intentosRealizados >= intentosMaximos) {
    // Perdió
    racha = 0;
    actualizarPuntuacion();
    
    setTimeout(() => {
      mostrarFinJuego(false);
      crearEfectoPerder();
    }, 500);
  }
}

function mostrarFinJuego(gano) {
  divJuego.style.display = "none";
  divFinJuego.style.display = "flex";
  
  if (gano) {
    tituloFin.textContent = "🎉 ¡Felicidades! ¡Ganaste!";
    mensajeFin.textContent = `Adivinaste la palabra: ${palabra}`;
    estadisticasFin.innerHTML = `
      <p>🏆 Puntos ganados: ${50 * (dificultad === "facil" ? 1 : dificultad === "medio" ? 2 : 3)}</p>
      <p>🔥 Racha actual: ${racha}</p>
    `;
  } else {
    tituloFin.textContent = "💀 ¡Fin del juego!";
    mensajeFin.textContent = `La palabra era: ${palabra}`;
    estadisticasFin.innerHTML = `
      <p>😔 Racha perdida</p>
      <p>💰 Puntos totales: ${puntos}</p>
    `;
  }
}

function crearTeclado() {
  tecladoDiv.innerHTML = "";
  const filas = [
    "QWERTYUIOP",
    "ASDFGHJKLÑ",
    "ZXCVBNM"
  ];
  
  filas.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "teclado-fila";
    
    for (let letra of fila) {
      const btn = document.createElement("button");
      btn.textContent = letra;
      btn.className = "btn-tecla";
      btn.onclick = () => {
        btn.disabled = true;
        btn.classList.add("usada");
        procesarLetra(letra);
      };
      filaDiv.appendChild(btn);
    }
    
    tecladoDiv.appendChild(filaDiv);
  });
}

function dibujarAhorcado(intentos) {
  limpiarCanvas();
  
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  
  // Base
  ctx.moveTo(20, 230); ctx.lineTo(120, 230);
  // Poste vertical
  ctx.moveTo(70, 230); ctx.lineTo(70, 20);
  // Poste horizontal
  ctx.moveTo(70, 20); ctx.lineTo(150, 20);
  // Cuerda
  ctx.moveTo(150, 20); ctx.lineTo(150, 40);
  
  ctx.stroke();
  
  ctx.strokeStyle = "#e74c3c";
  ctx.lineWidth = 2;
  
  if (intentos >= 1) { // Cabeza
    ctx.beginPath();
    ctx.arc(150, 55, 15, 0, Math.PI*2);
    ctx.stroke();
  }
  if (intentos >= 2) { // Cuerpo
    ctx.beginPath();
    ctx.moveTo(150, 70); ctx.lineTo(150, 120);
    ctx.stroke();
  }
  if (intentos >= 3) { // Brazo izquierdo
    ctx.beginPath();
    ctx.moveTo(150, 80); ctx.lineTo(120, 100);
    ctx.stroke();
  }
  if (intentos >= 4) { // Brazo derecho
    ctx.beginPath();
    ctx.moveTo(150, 80); ctx.lineTo(180, 100);
    ctx.stroke();
  }
  if (intentos >= 5) { // Pierna izquierda
    ctx.beginPath();
    ctx.moveTo(150, 120); ctx.lineTo(130, 160);
    ctx.stroke();
  }
  if (intentos >= 6) { // Pierna derecha
    ctx.beginPath();
    ctx.moveTo(150, 120); ctx.lineTo(170, 160);
    ctx.stroke();
  }
}

function limpiarCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- Efectos visuales ---
function crearEfectoAcierto() {
  const efecto = document.createElement("div");
  efecto.className = "efecto-acierto";
  efecto.textContent = "+10";
  efectosDiv.appendChild(efecto);
  
  setTimeout(() => {
    efecto.remove();
  }, 1000);
}

function crearEfectoError() {
  canvas.classList.add("temblor");
  setTimeout(() => {
    canvas.classList.remove("temblor");
  }, 500);
}

function crearEfectoGanar() {
  crearParticulas("ganar");
}

function crearEfectoPerder() {
  crearParticulas("perder");
}

function crearParticulas(tipo) {
  const container = document.getElementById("particulas-container");
  container.innerHTML = "";
  
  const colores = tipo === "ganar" 
    ? ["#2ecc71", "#3498db", "#9b59b6", "#f1c40f", "#e67e22"]
    : ["#e74c3c", "#c0392b", "#95a5a6", "#7f8c8d"];
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const particula = document.createElement("div");
      particula.className = "particula";
      particula.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
      particula.style.left = Math.random() * 100 + "%";
      particula.style.animationDelay = Math.random() * 0.5 + "s";
      container.appendChild(particula);
      
      setTimeout(() => {
        particula.remove();
      }, 3000);
    }, i * 30);
  }
}

function mostrarNotificacion(mensaje, tipo) {
  const notificacion = document.createElement("div");
  notificacion.className = `notificacion ${tipo}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.classList.add("mostrar");
  }, 10);
  
  setTimeout(() => {
    notificacion.classList.remove("mostrar");
    setTimeout(() => {
      notificacion.remove();
    }, 300);
  }, 2000);
}

// Eventos de teclado físicos
document.addEventListener("keydown", (e) => {
  if (divJuego.style.display === "block") {
    const letra = e.key.toUpperCase();
    if (letra.match(/[A-ZÑ]/) && letra.length === 1) {
      const btn = Array.from(document.querySelectorAll(".btn-tecla"))
        .find(b => b.textContent === letra);
      if (btn && !btn.disabled) {
        btn.disabled = true;
        btn.classList.add("usada");
        procesarLetra(letra);
      }
    }
  }
});