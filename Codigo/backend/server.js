// server.js
import express from "express";
import {
  crearPartida,
  obtenerPartida,
  listarPartidas,
  intentar
} from "./game.js";

/*
  Armo el servidor HTTP con Express y dejo listas las rutas de mi juego.
  expongo endpoints para crear una partida, traer una por id, listar el historial
  y registrar intentos. 
*/
const servidor = express();

/*
  Se lee el cuerpo de las peticiones que envía
  el frontend (nombres de jugadores, número intentado, etc.).
*/
servidor.use(express.json());

/*
  Creo una partida nueva con dos nombres. Espero { jugador1, jugador2 }.
  Si se crea bien, devuelvo 201 con el objeto público de la partida (incluye id).
  Si falta algo o hay un error, respondo 400 con un mensaje claro.
*/
servidor.post("/api/partidas", async function (solicitud, respuesta) {
  try {
    const cuerpo = solicitud.body || {};
    const jugador1 = cuerpo.jugador1;
    const jugador2 = cuerpo.jugador2;

    const partida = await crearPartida(jugador1, jugador2);
    respuesta.status(201).json(partida);
  } catch (error) {
    respuesta.status(400).json({ error: error.message || "Error" });
  }
});

/*
  Traigo los datos completos de una partida usando su id en la URL.
  Si la encuentro, devuelvo 200 con nombres, turno, ronda, totales y rondas.
  Si no existe, contesto 404 con un mensaje sencillo.
*/
servidor.get("/api/partidas/:id", async function (solicitud, respuesta) {
  try {
    const id = solicitud.params.id;
    const partida = await obtenerPartida(id);
    respuesta.json(partida);
  } catch (error) {
    respuesta.status(404).json({ error: error.message || "No se pudo encontrar" });
  }
});

/*
  Devuelvo la lista de partidas terminadas para el historial.
  Si todo sale bien regreso 200 con un arreglo.
  Si algo falla en el servidor, contesto 500.
*/
servidor.get("/api/partidas", async function (_solicitud, respuesta) {
  try {
    const lista = await listarPartidas();
    respuesta.json(lista);
  } catch (error) {
    respuesta.status(500).json({ error: "No se pudo listar" });
  }
});

/*
  Registro un intento dentro de una partida concreta.
  Espero en el body { jugador: 1|2, numero: N }. Si el intento es válido,
  devuelvo el nuevo estado (mensaje, turno siguiente, ronda actual, totales, etc.).
  Si el número no es válido, no es su turno o la partida ya terminó, respondo 400.
*/
servidor.post("/api/partidas/:id/intento", async function (solicitud, respuesta) {
  try {
    const id = solicitud.params.id;
    const cuerpo = solicitud.body || {};
    const jugador = cuerpo.jugador;
    const numero = cuerpo.numero;

    const resultado = await intentar(id, jugador, numero);
    respuesta.json(resultado);
  } catch (error) {
    respuesta.status(400).json({ error: error.message || "Error" });
  }
});

/*
  Si ninguna ruta coincide, respondo 404 en JSON para evitar el HTML por defecto de Express.
*/
servidor.use(function (_solicitud, respuesta) {
  respuesta.status(404).json({ error: "No se pudo encontrar" });
});

/*
  Arranco el servidor en el puerto 4000 y muestro la URL en consola para abrir rápido.
*/
const PUERTO = 4000;
servidor.listen(PUERTO, function () {
  console.log("Backend en http://localhost:" + PUERTO);
});
