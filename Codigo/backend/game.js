// Lógica del juego (data.json). Versión simple y directa.
// Mantiene las mismas funciones exportadas: crearPartida, obtenerPartida, listarPartidas, intentar.

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ----- RUTA DEL JSON -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "data.json");

// ----- UTILIDADES BÁSICAS -----
async function leerDB() {
  try {
    const txt = await readFile(DB_FILE, "utf8");
    return JSON.parse(txt);
  } catch {
    const base = { partidas: [] };
    await writeFile(DB_FILE, JSON.stringify(base, null, 2));
    return base;
  }
}
async function guardarDB(db) {
  await writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

function nuevoId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function numeroSecreto() {
  return Math.floor(Math.random() * 100) + 1; // 1..100
}
function crearRondas() {
  const arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push({
      n: i + 1,
      adivinador: i % 2 === 0 ? 1 : 2, // J1 empieza
      startAt: null,
      endAt: null,
      intentos: 0,
      duracionMs: 0,
      terminada: false,
    });
  }
  return arr;
}

// suma solo rondas terminadas
function totales(p) {
  let j1i = 0, j2i = 0, j1t = 0, j2t = 0;
  for (const r of p.rondas) {
    if (!r.terminada) continue;
    if (r.adivinador === 1) { j1i += r.intentos; j1t += r.duracionMs; }
    else { j2i += r.intentos; j2t += r.duracionMs; }
  }
  return { j1: { intentos: j1i, tiempoMs: j1t }, j2: { intentos: j2i, tiempoMs: j2t } };
}

// arma objeto público (sin revelar número secreto)
function publica(p, incluirRondas = false) {
  const t = totales(p);

  // intentos “en vivo” (sumo ronda actual si no terminó)
  let live1 = t.j1.intentos;
  let live2 = t.j2.intentos;
  const actual = p.rondas[p.rondaIndex];
  if (actual && !actual.terminada) {
    if (actual.adivinador === 1) live1 += actual.intentos;
    else live2 += actual.intentos;
  }

  const base = {
    id: p.id,
    jugador1: p.j1,
    jugador2: p.j2,
    createdAt: p.createdAt,
    rondaActual: p.rondaIndex + 1, // 1..6
    turno: actual ? actual.adivinador : null,
    terminado: p.terminado,
    ganador: p.ganador, // 1 | 2 | "empate" | null
    intentosJugador1: live1,
    intentosJugador2: live2,
    totales: { j1: t.j1, j2: t.j2 },
  };

  if (incluirRondas) {
    base.rondas = p.rondas.map(r => ({
      n: r.n,
      adivinador: r.adivinador,
      intentos: r.intentos,
      duracionMs: r.duracionMs,
      terminada: r.terminada
    }));
  }

  return base;
}

function decidirGanador(p) {
  const t = totales(p);
  if (t.j1.intentos < t.j2.intentos) return 1;
  if (t.j1.intentos > t.j2.intentos) return 2;
  if (t.j1.tiempoMs < t.j2.tiempoMs) return 1;
  if (t.j1.tiempoMs > t.j2.tiempoMs) return 2;
  return "empate";
}

// ================== EXPORTS ==================

// Crea partida: asigna J1/J2 aleatorio, J1 inicia, 6 rondas
export async function crearPartida(nombreA, nombreB) {
  if (!nombreA || !nombreB) throw new Error("Faltan jugadores");

  const j1Primero = Math.random() < 0.5;
  const j1 = j1Primero ? nombreA : nombreB;
  const j2 = j1Primero ? nombreB : nombreA;

  const db = await leerDB();
  const partida = {
    id: nuevoId(),
    j1, j2,
    createdAt: Date.now(),
    rondas: crearRondas(),
    rondaIndex: 0,
    target: numeroSecreto(),
    terminado: false,
    ganador: null
  };

  // arranca la primera ronda
  partida.rondas[0].startAt = Date.now();

  db.partidas.push(partida);
  await guardarDB(db);

  console.log("[crearPartida]", partida.id, j1, j2);
  return publica(partida);
}

export async function obtenerPartida(id) {
  const db = await leerDB();
  const p = db.partidas.find(x => x.id === id);
  if (!p) throw new Error("Partida no existe");
  return publica(p, true);
}

// Historial (simple): devuelve resumen; si no quieres cálculos aquí, el frontend puede pedir detalle
export async function listarPartidas() {
  const db = await leerDB();
  const lista = db.partidas
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map(p => {
      const pub = publica(p, false);
      return {
        id: pub.id,
        jugador1: pub.jugador1,
        jugador2: pub.jugador2,
        createdAt: pub.createdAt,
        terminado: pub.terminado,
        ganador: pub.ganador,
        // dejo totales agrupados (el frontend ya sabe mostrarlos o puede pedir detalle):
        totales: pub.totales
      };
    });

  console.log("[listarPartidas] ->", lista.length);
  return lista;
}

// Un intento: valida turno, suma intentos, compara, cierra ronda si acierta
export async function intentar(id, jugador, numero) {
  const db = await leerDB();
  const p = db.partidas.find(x => x.id === id);
  if (!p) throw new Error("Partida no existe");
  if (p.terminado) throw new Error("La partida ya terminó");

  const r = p.rondas[p.rondaIndex];
  if (!r) throw new Error("Ronda inválida");
  if (r.adivinador !== jugador) throw new Error("No es tu turno");

  const n = Number(numero);
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error("Número inválido (1-100)");

  r.intentos += 1;

  let resultado;
  if (n === p.target) {
    // fin de ronda
    r.endAt = Date.now();
    r.duracionMs = r.endAt - (r.startAt || r.endAt);
    r.terminada = true;
    resultado = "acertaste";

    // ¿terminó el juego?
    if (p.rondaIndex === 5) {
      p.terminado = true;
      p.ganador = decidirGanador(p);
    } else {
      // pasar a la siguiente
      p.rondaIndex += 1;
      p.target = numeroSecreto();
      const siguiente = p.rondas[p.rondaIndex];
      siguiente.startAt = Date.now();
    }
  } else if (n < p.target) {
    resultado = "mayor";
  } else {
    resultado = "menor";
  }

  await guardarDB(db);

  const pub = publica(p, true);
  const resp = {
    resultado,                        // "mayor" | "menor" | "acertaste"
    rondaTerminada: r.terminada,
    rondaActual: pub.rondaActual,
    turnoSiguiente: pub.turno,
    terminado: pub.terminado,
    ganador: pub.ganador,
    intentosJugador1: pub.intentosJugador1,
    intentosJugador2: pub.intentosJugador2,
    totales: pub.totales,
  };

  if (r.terminada) {
    resp.resumenRonda = {
      n: r.n,
      adivinador: r.adivinador,
      intentos: r.intentos,
      duracionMs: r.duracionMs
    };
    resp.rondas = pub.rondas; // para que el frontend pinte el resumen final si aplica
  }

  console.log("[intentar]", id, "J" + jugador, n, "->", resultado);
  return resp;
}
