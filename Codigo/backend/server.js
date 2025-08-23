// server.js (simplificado)
import express from "express";
import { crearPartida, obtenerPartida, listarPartidas, intentar } from "./game.js";

const app = express();
app.use(express.json());

// Crear partida
app.post("/api/partidas", async (req, res) => {
  try {
    const { jugador1, jugador2 } = req.body ?? {};
    const partida = await crearPartida(jugador1, jugador2);
    res.status(201).json(partida);
  } catch (err) {
    res.status(400).json({ error: err.message || "Error" });
  }
});

// Obtener una partida
app.get("/api/partidas/:id", async (req, res) => {
  try {
    const partida = await obtenerPartida(req.params.id);
    res.json(partida);
  } catch (err) {
    res.status(404).json({ error: err.message || "No encontrada" });
  }
});

// Listar partidas
app.get("/api/partidas", async (_req, res) => {
  try {
    const lista = await listarPartidas();
    res.json(lista);
  } catch {
    res.status(500).json({ error: "No se pudo listar" });
  }
});

// Intento
app.post("/api/partidas/:id/intento", async (req, res) => {
  try {
    const { jugador, numero } = req.body ?? {};
    const r = await intentar(req.params.id, jugador, numero);
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message || "Error" });
  }
});

// 404 JSON (opcional, pero útil para no ver HTML de Express)
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(4000, () => console.log("Backend en http://localhost:4000"));
