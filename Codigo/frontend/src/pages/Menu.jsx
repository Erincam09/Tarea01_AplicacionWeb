// /src/pages/Menu.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPartida } from "../api";

export default function Menu() {
  const nav = useNavigate();
  const [jugador1, setJ1] = useState("");
  const [jugador2, setJ2] = useState("");
  const [sending, setSending] = useState(false);
  const canPlay = jugador1.trim() && jugador2.trim();

  async function crear() {
    if (!canPlay || sending) return;
    setSending(true);
    try {
      const p = await crearPartida({
        jugador1: jugador1.trim(),
        jugador2: jugador2.trim(),
      });
      nav("/juego", { state: { partidaId: p.id } });
    } catch (e) {
      alert(e.message || "No se pudo crear la partida");
    } finally {
      setSending(false);
    }
  }

  // estilos simples inline
  const page = {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "#4a90e2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  };
  const card = {
    background: "#fff",
    borderRadius: 15,
    padding: 40,
    boxShadow: "0 4px 8px rgba(0,0,0,.2)",
    width: 420,
    color: "#111827",
  };
  const title = {
    margin: 0,
    marginBottom: 10,
    fontWeight: 800,
    fontSize: 28,
    color: "#333",
    textAlign: "center",
  };
  const subtitle = { margin: 0, marginBottom: 30, color: "#666", textAlign: "center" };
  const label = { display: "block", fontWeight: 700, color: "#333", marginBottom: 6 };
  const input = {
    width: "100%",
    height: 44,
    padding: "0 12px",
    boxSizing: "border-box",
    border: "2px solid #d0d7de",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
    outline: "none",
  };
  const actions = { display: "flex", gap: 12, justifyContent: "center" };
  const btn = (bg) => ({
    height: 44,
    padding: "0 18px",
    border: "none",
    borderRadius: 8,
    fontWeight: 800,
    color: "#fff",
    background: bg,
    cursor: "pointer",
  });

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>🔢 Adivina el Número</h1>
        <p style={subtitle}>Del 1 al 100</p>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="j1" style={label}>Jugador 1:</label>
          <input
            id="j1"
            style={input}
            placeholder="Escribe tu nombre…"
            value={jugador1}
            onChange={(e) => setJ1(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#d0d7de")}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="j2" style={label}>Jugador 2:</label>
          <input
            id="j2"
            style={input}
            placeholder="Escribe tu nombre…"
            value={jugador2}
            onChange={(e) => setJ2(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#d0d7de")}
          />
        </div>

        <div style={actions}>
          <button
            onClick={crear}
            disabled={!canPlay || sending}
            style={{
              ...btn("#28a745"),
              background: !canPlay || sending ? "#cbd5e1" : "#28a745",
              cursor: !canPlay || sending ? "not-allowed" : "pointer",
            }}
          >
            {sending ? "Guardando…" : "Jugar"}
          </button>

          <button
            onClick={() => nav("/historial")}
            style={btn("#007bff")}
          >
            Historial
          </button>
        </div>
      </div>
    </div>
  );
}
