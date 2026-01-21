let palabra = "";
let progreso = [];
let letrasIncorrectas = [];
let intentosMaximos = 6;
let intentosRealizados = 0;

// Referencias DOM
const progresoDiv = document.getElementById("progreso");
const incorrectasDiv = document.getElementById("incorrectas");
const intentosDiv = document.getElementById("intentos");
const canvas = document.getElementById("ahorcado");
const ctx = canvas.getContext("2d");

const inputLetra = document.getElementById("letra");
const btnIntentar = document.getElementById("btn-intentar");
const letrasDiv = document.getElementById("letras");

const inputPalabra = document.getElementById("palabraSecreta");
const btnIniciar = document.getElementById("btn-iniciar");
const divConfig = document.getElementById("configuracion");
const divJuego = document.getElementById("juego");

// --- Inicializar juego ---
btnIniciar.addEventListener("click", () => {
  palabra = inputPalabra.value.toUpperCase();
  if (!palabra.match(/^[A-ZÑ]+$/)) {
    alert("La palabra debe contener solo letras.");
    return;
  }
  progreso = Array(palabra.length).fill("_");
  letrasIncorrectas = [];
  intentosRealizados = 0;

  divConfig.style.display = "none";
  divJuego.style.display = "block";

  crearBotones();
  actualizarInterfaz();
});

// --- Funciones ---
function actualizarInterfaz() {
  progresoDiv.textContent = progreso.join(" ");
  incorrectasDiv.textContent = "❌ Letras incorrectas: " + letrasIncorrectas.join(", ");
  intentosDiv.textContent = "🔁 Intentos restantes: " + (intentosMaximos - intentosRealizados);
  dibujarAhorcado(intentosRealizados);
}

function procesarLetra(letra) {
  if (!letra.match(/[A-ZÑ]/)) {
    alert("Por favor ingresa una letra válida.");
    return;
  }

  if (progreso.includes(letra) || letrasIncorrectas.includes(letra)) {
    alert("Ya intentaste esa letra.");
    return;
  }

  if (palabra.includes(letra)) {
    for (let i = 0; i < palabra.length; i++) {
      if (palabra[i] === letra) {
        progreso[i] = letra;
      }
    }
  } else {
    letrasIncorrectas.push(letra);
    intentosRealizados++;
  }

  actualizarInterfaz();
  verificarFin();
}

function intentarLetra() {
  const letra = inputLetra.value.toUpperCase();
  inputLetra.value = "";
  inputLetra.focus();
  procesarLetra(letra);
}

function verificarFin() {
  if (!progreso.includes("_")) {
    alert("🎉 ¡Ganaste! La palabra era: " + palabra);
    deshabilitarEntrada();
  } else if (intentosRealizados >= intentosMaximos) {
    alert("💀 ¡Perdiste! La palabra era: " + palabra);
    deshabilitarEntrada();
  }
}

function deshabilitarEntrada() {
  btnIntentar.disabled = true;
  inputLetra.disabled = true;
  document.querySelectorAll(".btn-letra").forEach(btn => btn.disabled = true);
}

function dibujarAhorcado(intentos) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 180); ctx.lineTo(120, 180);
  ctx.moveTo(70, 180); ctx.lineTo(70, 20);
  ctx.lineTo(150, 20); ctx.lineTo(150, 40);
  ctx.stroke();

  if (intentos >= 1) { ctx.beginPath(); ctx.arc(150, 55, 15, 0, Math.PI*2); ctx.stroke(); }
  if (intentos >= 2) { ctx.beginPath(); ctx.moveTo(150, 70); ctx.lineTo(150, 120); ctx.stroke(); }
  if (intentos >= 3) { ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(120, 100); ctx.stroke(); }
  if (intentos >= 4) { ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(180, 100); ctx.stroke(); }
  if (intentos >= 5) { ctx.beginPath(); ctx.moveTo(150, 120); ctx.lineTo(130, 160); ctx.stroke(); }
  if (intentos >= 6) { ctx.beginPath(); ctx.moveTo(150, 120); ctx.lineTo(170, 160); ctx.stroke(); }
}

function crearBotones() {
  letrasDiv.innerHTML = "";
  const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let letra of letras) {
    const btn = document.createElement("button");
    btn.textContent = letra;
    btn.className = "btn-letra";
    btn.onclick = () => {
      btn.disabled = true;
      procesarLetra(letra);
    };
    letrasDiv.appendChild(btn);
  }
}

// --- Eventos ---
btnIntentar.addEventListener("click", intentarLetra);
inputLetra.addEventListener("keypress", function(e) {
  if (e.key === "Enter") intentarLetra();
});