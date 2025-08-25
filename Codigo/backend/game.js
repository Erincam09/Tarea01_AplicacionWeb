// backend/game.js
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/*
  Módulo de lógica del juego.
  - Partidas en curso en memoria.
  - Partidas terminadas en JSON para historial.
  - 6 rondas alternadas, número objetivo 1..100.
  - ID numérico incremental para cada partida (1, 2, 3, ...).
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaDb = path.join(__dirname, "data.json");

/*
  Almacén de partidas activas en memoria.
  La clave es el id convertido a string (para usar como clave de objeto).
*/
const partidasVivas = {};

/*
  Contador del próximo id numérico.
  Se inicializa leyendo el archivo para encontrar el mayor id guardado
  y arrancar desde ahí. Luego incrementa en uno cada vez.
*/
let proximoId = null;

/*
  Lee el archivo JSON de historial.
  Si no existe, crea { partidas: [] }.
*/
async function leerDb() {
  try {
    const texto = await readFile(rutaDb, "utf8");
    return JSON.parse(texto);
  } catch {
    const base = { partidas: [] };
    await writeFile(rutaDb, JSON.stringify(base, null, 2));
    return base;
  }
}

/*
  Escribe el objeto recibido en el archivo JSON con formato legible.
*/
async function guardarDb(db) {
  await writeFile(rutaDb, JSON.stringify(db, null, 2));
}

/*
  Calcula y devuelve el próximo id numérico.
  Busca el máximo id guardado en archivo (y en memoria) y arranca desde el siguiente.
*/
async function obtenerSiguienteId() {
  if (proximoId === null) {
    const db = await leerDb();
    let maxId = 0;
    // ids guardados en archivo JSON (terminadas)
    for (let i = 0; i < db.partidas.length; i++) {
      const n = parseInt(db.partidas[i].id, 10);
      if (n > maxId) {
        maxId = n;
      }
    }
    // ids en memoria (en curso)
    for (const clave in partidasVivas) {
      const n = parseInt(partidasVivas[clave].id, 10);
      if (n > maxId) {
        maxId = n;
      }
    }
    proximoId = maxId;
  }
  proximoId = proximoId + 1;
  return proximoId;
}

/*
  Devuelve un número entero aleatorio en el rango 1..100.
*/
function numeroSecreto() {
  return Math.floor(Math.random() * 100) + 1;
}

/*
  Crea el arreglo de 6 rondas con el adivinador alternando entre 1 y 2.
*/
function crearRondas() {
  const arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push({
      n: i + 1,
      adivinador: i % 2 === 0 ? 1 : 2,
      startAt: null,
      endAt: null,
      intentos: 0,
      duracionMs: 0,
      terminada: false
    });
  }
  return arr;
}

/*
  Suma intentos y tiempo total de todas las rondas terminadas para cada jugador.
*/
function sumarTotales(partida) {
  let j1i = 0, j2i = 0, j1t = 0, j2t = 0;
  for (let i = 0; i < partida.rondas.length; i++) {
    const ronda = partida.rondas[i];
    if (!ronda.terminada) continue;
    if (ronda.adivinador === 1) {
      j1i += ronda.intentos;
      j1t += ronda.duracionMs;
    } else {
      j2i += ronda.intentos;
      j2t += ronda.duracionMs;
    }
  }
  return { j1: { intentos: j1i, tiempoMs: j1t }, j2: { intentos: j2i, tiempoMs: j2t } };
}

/*
  Construye un objeto público para el frontend.
  No incluye el número objetivo. Incluye intentos “en vivo” sumando la ronda actual
  si aún no terminó. Puede incluir el arreglo de rondas si se solicita.
*/
function vistaPublica(partida, incluirRondas) {
  const tot = sumarTotales(partida);

  let enVivoJ1 = tot.j1.intentos;
  let enVivoJ2 = tot.j2.intentos;
  const rondaActualObj = partida.rondas[partida.rondaIndex];
  if (rondaActualObj && !rondaActualObj.terminada) {
    if (rondaActualObj.adivinador === 1) enVivoJ1 += rondaActualObj.intentos;
    else enVivoJ2 += rondaActualObj.intentos;
  }

  const base = {
    id: partida.id,
    jugador1: partida.j1,
    jugador2: partida.j2,
    createdAt: partida.createdAt,
    rondaActual: partida.rondaIndex + 1,
    turno: rondaActualObj ? rondaActualObj.adivinador : null,
    terminado: partida.terminado,
    ganador: partida.ganador,
    intentosJugador1: enVivoJ1,
    intentosJugador2: enVivoJ2,
    totales: { j1: tot.j1, j2: tot.j2 }
  };

  if (incluirRondas) {
    base.rondas = [];
    for (let i = 0; i < partida.rondas.length; i++) {
      const r = partida.rondas[i];
      base.rondas.push({
        n: r.n,
        adivinador: r.adivinador,
        intentos: r.intentos,
        duracionMs: r.duracionMs,
        terminada: r.terminada
      });
    }
  }

  return base;
}

/*
  Determina el resultado final con base en totales:
  primero menos intentos; si empatan, menor tiempo; si sigue, “empate”.
*/
function decidirGanador(partida) {
  const tot = sumarTotales(partida);
  if (tot.j1.intentos < tot.j2.intentos) return 1;
  if (tot.j1.intentos > tot.j2.intentos) return 2;
  if (tot.j1.tiempoMs < tot.j2.tiempoMs) return 1;
  if (tot.j1.tiempoMs > tot.j2.tiempoMs) return 2;
  return "empate";
}

/*
  Crea una partida, asigna jugadores, inicia la primera ronda
  y la guarda en memoria con un id numérico incremental.
*/
export async function crearPartida(nombreA, nombreB) {
  if (!nombreA || !nombreB) throw new Error("Faltan jugadores");

  const idNuevo = await obtenerSiguienteId();

  const j1Primero = Math.random() < 0.5;
  const j1 = j1Primero ? nombreA : nombreB;
  const j2 = j1Primero ? nombreB : nombreA;

  const partida = {
    id: idNuevo,
    j1: j1,
    j2: j2,
    createdAt: Date.now(),
    rondas: crearRondas(),
    rondaIndex: 0,
    target: numeroSecreto(),
    terminado: false,
    ganador: null
  };

  partida.rondas[0].startAt = Date.now();
  partidasVivas[String(partida.id)] = partida;

  return vistaPublica(partida, true);
}

/*
  Obtiene una partida por id, buscando primero en memoria y luego en archivo.
*/
export async function obtenerPartida(id) {
  const clave = String(id);
  if (partidasVivas[clave]) {
    return vistaPublica(partidasVivas[clave], true);
  }
  const db = await leerDb();
  for (let i = 0; i < db.partidas.length; i++) {
    if (Number(db.partidas[i].id) === Number(id)) {
      return vistaPublica(db.partidas[i], true);
    }
  }
  throw new Error("Partida no existe");
}

/*
  Lista partidas terminadas del archivo JSON, ordenadas de más nuevas a más viejas.
*/
export async function listarPartidas() {
  const db = await leerDb();
  const lista = [];
  for (let i = 0; i < db.partidas.length; i++) {
    const p = db.partidas[i];
    if (p.terminado) {
      const pub = vistaPublica(p, false);
      lista.push({
        id: pub.id,
        jugador1: pub.jugador1,
        jugador2: pub.jugador2,
        createdAt: pub.createdAt,
        terminado: pub.terminado,
        ganador: pub.ganador,
        totales: pub.totales
      });
    }
  }
  lista.sort(function (a, b) {
    const fa = a.createdAt || 0;
    const fb = b.createdAt || 0;
    return fb - fa;
  });
  return lista;
}

/*
  Registra un intento en una partida activa. Valida turno y rango del número.
  Si acierta y era la última ronda, calcula ganador, guarda en JSON y
  elimina la partida de memoria. Devuelve el estado público actualizado.
*/
export async function intentar(id, jugador, numero) {
  const clave = String(id);
  const partida = partidasVivas[clave];
  if (!partida) throw new Error("La partida ya terminó o no existe");
  if (partida.terminado) throw new Error("La partida ya terminó");

  const ronda = partida.rondas[partida.rondaIndex];
  if (!ronda) throw new Error("Ronda inválida");
  if (ronda.adivinador !== jugador) throw new Error("No es tu turno");

  const n = Number(numero);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new Error("Número inválido (1-100)");
  }

  ronda.intentos = ronda.intentos + 1;

  let resultado;
  let mensaje = "";

  if (n === partida.target) {
    ronda.endAt = Date.now();
    ronda.duracionMs = ronda.endAt - (ronda.startAt || ronda.endAt);
    ronda.terminada = true;
    resultado = "acertaste";

    const nombreAdivinador = ronda.adivinador === 1 ? partida.j1 : partida.j2;
    const segs = Math.round((ronda.duracionMs || 0) / 1000);
    mensaje = "✔ Ronda " + ronda.n + ": " + nombreAdivinador +
              " en " + ronda.intentos + " intento(s) y " + segs + "s.";

    if (partida.rondaIndex === 5) {
      partida.terminado = true;
      partida.ganador = decidirGanador(partida);

      if (partida.ganador === "empate") {
        mensaje += " Empate.";
      } else {
        const nombreGanador = partida.ganador === 1 ? partida.j1 : partida.j2;
        mensaje += " Gana " + nombreGanador + ".";
      }

      const db = await leerDb();
      const copia = JSON.parse(JSON.stringify(partida));
      delete copia.target;
      db.partidas.push(copia);
      await guardarDb(db);
      delete partidasVivas[clave];
    } else {
      partida.rondaIndex = partida.rondaIndex + 1;
      partida.target = numeroSecreto();
      const siguiente = partida.rondas[partida.rondaIndex];
      siguiente.startAt = Date.now();
    }
  } else if (n < partida.target) {
    resultado = "mayor";
    mensaje = "El número es mayor";
  } else {
    resultado = "menor";
    mensaje = "El número es menor";
  }

  const pub = vistaPublica(partida, true);

  const respuesta = {
    resultado: resultado,
    mensaje: mensaje,                 
    rondaTerminada: ronda.terminada,
    rondaActual: pub.rondaActual,
    turnoSiguiente: pub.turno,
    terminado: pub.terminado,
    ganador: pub.ganador,
    intentosJugador1: pub.intentosJugador1,
    intentosJugador2: pub.intentosJugador2,
    totales: pub.totales
  };

  if (ronda.terminada) {
    respuesta.resumenRonda = {
      n: ronda.n,
      adivinador: ronda.adivinador,
      intentos: ronda.intentos,
      duracionMs: ronda.duracionMs
    };
    respuesta.rondas = pub.rondas;
  }

  return respuesta;
}

