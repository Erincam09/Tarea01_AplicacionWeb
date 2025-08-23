// /src/pages/Juego.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerPartida, enviarIntento } from "../api";

export default function Juego() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const partidaId = state?.partidaId;

  const [j1Name, setJ1Name] = useState("");
  const [j2Name, setJ2Name] = useState("");
  const [turno, setTurno] = useState(1);
  const [ronda, setRonda] = useState(1);
  const [valor, setValor] = useState("");
  const [msg, setMsg] = useState("");
  const [i1, setI1] = useState(0);
  const [i2, setI2] = useState(0);
  const [fin, setFin] = useState(false);
  const [ganador, setGanador] = useState(null);
  const [rondas, setRondas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!partidaId) { navigate("/"); return; }
    (async () => {
      try {
        const p = await obtenerPartida(partidaId);
        setJ1Name(p.jugador1);
        setJ2Name(p.jugador2);
        setTurno(p.turno ?? 1);
        setRonda(p.rondaActual ?? 1);
        setI1(p.intentosJugador1 ?? 0);
        setI2(p.intentosJugador2 ?? 0);
        setFin(!!p.terminado);
        setGanador(p.ganador ?? null);
        setRondas(p.rondas || []);
      } catch {
        setMsg("No se pudo cargar la partida");
      } finally {
        setCargando(false);
      }
    })();
  }, [partidaId, navigate]);

  async function intentar() {
    if (!valor) return;
    const n = parseInt(valor, 10);
    if (isNaN(n) || n < 1 || n > 100) { setMsg("Ingresa un número entre 1 y 100"); return; }
    try {
      const r = await enviarIntento(partidaId, { jugador: turno, numero: n });
      setI1(r.intentosJugador1);
      setI2(r.intentosJugador2);
      setTurno(r.turnoSiguiente ?? turno);
      setRonda(r.rondaActual ?? ronda);

      if (r.resultado === "mayor") setMsg("El número es mayor");
      if (r.resultado === "menor") setMsg("El número es menor");

      if (r.rondaTerminada && r.resumenRonda) {
        const quien = r.resumenRonda.adivinador === 1 ? j1Name : j2Name;
        const segs = Math.round((r.resumenRonda.duracionMs || 0) / 1000);
        setMsg(`✔ Ronda ${r.resumenRonda.n}: ${quien} en ${r.resumenRonda.intentos} intento(s) y ${segs}s.`);
      }

      if (r.terminado) {
        if (r.rondas) setRondas(r.rondas);
        setGanador(r.ganador);
        setFin(true);
      }
      setValor("");
    } catch (e) {
      setMsg(e.message || "Error al intentar");
    }
  }

  // Totales simples
  function totales() {
    if (!rondas || rondas.length === 0) {
      return { j1: { intentos: i1, tiempoMs: 0 }, j2: { intentos: i2, tiempoMs: 0 } };
    }
    let t1i = 0, t2i = 0, t1ms = 0, t2ms = 0;
    for (const r of rondas) {
      if (!r) continue;
      if (r.adivinador === 1) { t1i += r.intentos || 0; t1ms += r.duracionMs || 0; }
      else { t2i += r.intentos || 0; t2ms += r.duracionMs || 0; }
    }
    return { j1: { intentos: t1i, tiempoMs: t1ms }, j2: { intentos: t2i, tiempoMs: t2ms } };
  }
  const t = totales();
  const nombreGanador = ganador === "empate" ? "Empate" : (ganador === 1 ? j1Name : j2Name);

  if (cargando) return <div style={{ padding: 24 }}>Cargando…</div>;

  // Estilos inline
  const page = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "#4a90e2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  };
  const card = {
    background: "#fff", borderRadius: 18, padding: 28,
    boxShadow: "0 12px 28px rgba(0,0,0,.18)", width: 700, color: "#111827"
  };
  const header = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 };
  const title = { margin: 0, fontSize: 24, color: "#111827" };
  const chipBox = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0 12px" };
  const chip = { background: "#f3f4f6", borderRadius: 12, padding: "10px 12px" };
  const msgBox = {
    margin: "0 0 12px", background: "#fff8db", color: "#7a5c00",
    border: "1px solid #ffeaa7", borderRadius: 12, padding: "10px 12px", fontSize: 14, textAlign: "left"
  };
  const actions = { display: "flex", justifyContent: "center", alignItems: "center", gap: 10 };
  const input = {
    width: 220, height: 46, padding: "0 12px", boxSizing: "border-box",
    border: "2px solid #d0d7de", borderRadius: 12, background: "#fff",
    color: "#111827", outline: "none", textAlign: "center"
  };
  const btn = {
    height: 46, padding: "0 18px", border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 800, color: "#fff", background: "#22c55e", cursor: "pointer"
  };
  const winner = (isEmpate) => ({
    margin: "6px 0 14px",
    background: isEmpate ? "#e5e7eb" : "#d1fae5",
    color: isEmpate ? "#374151" : "#065f46",
    border: `1px solid ${isEmpate ? "#e5e7eb" : "#a7f3d0"}`,
    padding: "10px 12px", borderRadius: 12, textAlign: "center", fontWeight: 800
  });
  const totalsGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 };
  const totalCard = { background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: 14, textAlign: "center" };
  const tableWrap = { border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" };
  const th = { padding: "10px 12px", fontWeight: 800, color: "#111827", borderRight: "1px solid #e5e7eb", whiteSpace: "nowrap", textAlign: "left" };
  const td = { padding: "10px 12px", color: "#111827", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" };

  return (
    <div style={page}>
      <style>{`.rondas tbody tr:nth-child(odd){ background:#fafafa }`}</style>

      <div style={card}>
        <div style={header}>
          <span aria-hidden style={{ fontSize: 22 }}>🎲</span>
          <h1 style={title}>Adivina el Número (1–100)</h1>
        </div>

        <div style={chipBox}>
          <div style={{ ...chip, textAlign: "left", color: turno===1 ? "#16a34a" : "#6b7280", fontWeight: turno===1 ? 700 : 500 }}>
            {j1Name} — intentos: {i1}
          </div>
          <div style={{ ...chip, textAlign: "right", color: turno===2 ? "#16a34a" : "#6b7280", fontWeight: turno===2 ? 700 : 500 }}>
            {j2Name} — intentos: {i2}
          </div>
        </div>

        {!fin && (
          <>
            <p style={{ margin: "0 0 14px", color: "#6b7280", textAlign: "center" }}>
              Ronda <b>{ronda}</b> de 6 — Turno de <b>{turno===1 ? j1Name : j2Name}</b>
            </p>

            {msg && <div style={msgBox}>{msg}</div>}

            <div style={actions}>
              <input
                type="number"
                min={1}
                max={100}
                placeholder="1 a 100"
                value={valor}
                onChange={(e)=>setValor(e.target.value)}
                onKeyDown={(e)=> e.key==="Enter" && intentar()}
                style={input}
                onFocus={(e)=> e.target.style.borderColor = "#2563eb"}
                onBlur={(e)=> e.target.style.borderColor = "#d0d7de"}
              />
              <button style={btn} onClick={intentar}>Intentar</button>
            </div>
          </>
        )}

        {fin && (
          <div style={{ marginTop: 4 }}>
            <div style={winner(ganador==="empate")}>
              {ganador==="empate" ? "Resultado: Empate" : `Resultado: ¡Gana ${nombreGanador}!`}
            </div>

            <div style={totalsGrid}>
              <div style={totalCard}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{j1Name}</div>
                <div>Intentos: <b>{t.j1.intentos}</b></div>
                <div>Tiempo: <b>{Math.round(t.j1.tiempoMs/1000)}s</b></div>
              </div>
              <div style={totalCard}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{j2Name}</div>
                <div>Intentos: <b>{t.j2.intentos}</b></div>
                <div>Tiempo: <b>{Math.round(t.j2.tiempoMs/1000)}s</b></div>
              </div>
            </div>

            <div style={tableWrap}>
              <table className="rondas" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={th}>Ronda</th>
                    <th style={th}>Adivinó</th>
                    <th style={th}>Intentos</th>
                    <th style={{ ...th, borderRight: "none" }}>Tiempo (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {(rondas && rondas.length > 0) ? rondas.map((r, idx) => (
                    <tr key={r.n ?? idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={td}>{r.n}</td>
                      <td style={td}>{r.adivinador === 1 ? j1Name : j2Name}</td>
                      <td style={td}>{r.intentos}</td>
                      <td style={{ ...td, borderRight: "none" }}>{Math.round((r.duracionMs || 0) / 1000)}</td>
                    </tr>
                  )) : (
                    <tr><td style={{ padding: 14 }} colSpan={4}>No hay datos de rondas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button
                onClick={()=>navigate("/")}
                style={{ height: 46, padding: "0 18px", background: "#2563eb", color: "#fff",
                         border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
              >
                Volver al menú
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
