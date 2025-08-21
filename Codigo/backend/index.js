import express from "express";

console.log("Cargando backend…");

const app = express();
app.use(express.json());

// Log para ver qué llega
app.use((req, _res, next) => { console.log("HIT:", req.method, req.url); next(); });

app.get("/", (_req, res) => {
  res.send("Backend OK ✅");
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hola desde el backend erin 👋" });
});

app.post("/api/echo", (req, res) => {
  res.json({ recibido: req.body?.texto ?? null, ok: true });
});

// 404 explícito (si escribimos mal la ruta lo veremos)
app.use((req, res) => {
  console.log("404:", req.method, req.url);
  res.status(404).json({ error: "Not found" });
});

app.listen(4000, () => {
  console.log("Backend escuchando en http://localhost:4000");
});
