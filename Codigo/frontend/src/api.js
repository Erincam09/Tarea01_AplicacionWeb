// api.js (simple) – el frontend usa el proxy de Vite hacia /api

export async function crearPartida({ jugador1, jugador2 }) {
  const res = await fetch("/api/partidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jugador1, jugador2 })
  });
  if (!res.ok) throw new Error("No se pudo crear la partida");
  return res.json();
}

export async function obtenerPartida(id) {
  const res = await fetch(`/api/partidas/${id}`);
  if (!res.ok) throw new Error("No se pudo obtener la partida");
  return res.json();
}

export async function enviarIntento(id, payload) {
  const res = await fetch(`/api/partidas/${id}/intento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload) // { jugador: 1|2, numero }
  });
  if (!res.ok) throw new Error("No se pudo enviar el intento");
  return res.json();
}

export async function listarPartidas() {
  const res = await fetch("/api/partidas");
  if (!res.ok) throw new Error("No se pudo listar el historial");
  return res.json();
}
