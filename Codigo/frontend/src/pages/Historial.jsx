// /src/pages/Historial.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPartidas } from "../api";

export default function Historial() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        setError("");
        const list = await listarPartidas();
        // orden simple: más nuevas primero
        const ordenado = (list || []).slice().sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
        setItems(ordenado);
      } catch (e) {
        setError(e.message || "No se pudo listar el historial");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  function ganadorTexto(p) {
    if (p.ganador === "empate") return "Empate";
    if (p.ganador === 1) return p.jugador1;
    if (p.ganador === 2) return p.jugador2;
    return "—";
  }
  function fmtTiempo(ms) {
    if (ms == null) return "—";
    return `${Math.round(ms / 1000)}s`;
  }

  // estilos sencillos
  const page = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "#4a90e2", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  };
  const card = {
    background: "#fff", borderRadius: 18, padding: 24,
    boxShadow: "0 12px 28px rgba(0,0,0,.18)", width: 1000, color: "#111827"
  };
  const header = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
  const title = { margin: 0, fontSize: 22, color: "#111827" };
  const btnMenu = { height: 40, padding: "0 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" };

  const tableWrap = { border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginTop: 12 };
  const th = { padding: "10px 12px", fontWeight: 800, color: "#111827", borderRight: "1px solid #e5e7eb", whiteSpace: "nowrap", textAlign: "left" };
  const td = { padding: "10px 12px", color: "#111827", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap", verticalAlign: "middle" };
  const idx = { display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 54, height: 28, padding: "0 10px", borderRadius: 999, fontWeight: 800, background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0c4a6e" };
  const pill = { display: "inline-block", padding: "4px 10px", borderRadius: 999, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#1f2937", fontWeight: 800 };
  const badgeG = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 800, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
  const badgeY = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 800, background: "#fef9c3", color: "#713f12", border: "1px solid #fde68a" };

  return (
    <div style={page}>
      {/* rayas alternas */}
      <style>{`.tabla-his tbody tr:nth-child(odd){ background:#fafafa }`}</style>

      <div style={card}>
        <div style={header}>
          <h1 style={title}>Historial de partidas</h1>
          <button style={btnMenu} onClick={()=>nav("/")}>Menú</button>
        </div>

        {cargando && <div style={{ padding: 12 }}>Cargando…</div>}

        {!cargando && error && (
          <div style={{ background:"#fee2e2", color:"#7f1d1d", border:"1px solid #fecaca", borderRadius:12, padding:"10px 12px", marginTop:12 }}>
            {error}
          </div>
        )}

        {!cargando && !error && items.length === 0 && (
          <div style={{ background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", borderRadius:12, padding:14, textAlign:"center", marginTop:12 }}>
            No hay partidas para mostrar.
          </div>
        )}

        {!cargando && !error && items.length > 0 && (
          <div style={tableWrap}>
            <table className="tabla-his" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={th}>Partida</th>
                  <th style={th}>Jugador 1</th>
                  <th style={th}>Intentos J1</th>
                  <th style={th}>Tiempo J1</th>
                  <th style={th}>Jugador 2</th>
                  <th style={th}>Intentos J2</th>
                  <th style={th}>Tiempo J2</th>
                  <th style={{ ...th, borderRight: "none" }}>Ganador / Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p, idxNum) => {
                  const num = idxNum + 1;
                  const i1 = p.totales?.j1?.intentos ?? "—";
                  const t1 = p.totales?.j1?.tiempoMs != null ? fmtTiempo(p.totales.j1.tiempoMs) : "—";
                  const i2 = p.totales?.j2?.intentos ?? "—";
                  const t2 = p.totales?.j2?.tiempoMs != null ? fmtTiempo(p.totales.j2.tiempoMs) : "—";
                  const ganador = ganadorTexto(p);

                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={td}><div style={idx}>#{String(num).padStart(2, "0")}</div></td>
                      <td style={td}><span style={pill}>{p.jugador1 || "—"}</span></td>
                      <td style={td}>{i1}</td>
                      <td style={td}>{t1}</td>
                      <td style={td}><span style={pill}>{p.jugador2 || "—"}</span></td>
                      <td style={td}>{i2}</td>
                      <td style={td}>{t2}</td>
                      <td style={{ ...td, borderRight: "none" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {ganador === "Empate"
                            ? <span style={{ ...pill, background:"#e5e7eb", borderColor:"#d1d5db" }}>Empate</span>
                            : <span style={pill}>{ganador}</span>}
                          {p.terminado
                            ? <span style={badgeG}>Terminado</span>
                            : <span style={badgeY}>En curso</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
