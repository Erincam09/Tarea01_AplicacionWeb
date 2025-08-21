// api.js – helpers del frontend (usa el proxy de Vite a /api)

async function okOrThrow(r) {
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { msg += " - " + (await r.json()).error; } catch {}
    throw new Error(msg);
  }
  return r.json();
}

export async function crearPartida({ jugador1, jugador2 }) {
  const r = await fetch("/api/partidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jugador1, jugador2 }),
  });
  return okOrThrow(r); // { id, jugador1, jugador2 }
}

export async function obtenerPartida(id) {
  const r = await fetch(`/api/partidas/${id}`);
  return okOrThrow(r);
}

export async function enviarIntento(id, payload) {
  const r = await fetch(`/api/partidas/${id}/intento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // { jugador: 1|2, numero }
  });
  return okOrThrow(r);
}

export async function listarPartidas() {
  const r = await fetch("/api/partidas");
  return okOrThrow(r);
}
