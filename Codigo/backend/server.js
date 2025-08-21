import express from "express";
import { crearPartida, obtenerPartida, listarPartidas, intentar } from "./game.js";

const app = express();
app.use(express.json());

// Probar rápido
app.get("/", (_req, res) => res.send("Backend OK ✅"));

// Crear partida (asigna aleatoriamente roles J1/J2)
app.post("/api/partidas", async (req, res) => {
  try {
    const { jugador1, jugador2 } = req.body || {};
    const pub = await crearPartida(jugador1, jugador2);
    res.status(201).json(pub);
  } catch (e) {
    console.log("POST /api/partidas error:", e.message);
    res.status(400).json({ error: e.message });
  }
});

// Obtener/listar
app.get("/api/partidas/:id", async (req, res) => {
  try {
    const pub = await obtenerPartida(req.params.id);
    res.json(pub);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
app.get("/api/partidas", async (_req, res) => {
  try {
    const list = await listarPartidas();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: "No se pudo listar" });
  }
});

// Intento
app.post("/api/partidas/:id/intento", async (req, res) => {
  try {
    const { jugador, numero } = req.body || {};
    const out = await intentar(req.params.id, jugador, numero);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(4000, () => {
  console.log("Backend escuchando en http://localhost:4000");
});
