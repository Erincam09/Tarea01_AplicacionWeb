import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPartida } from "../api";

export default function Menu() {
  const nav = useNavigate();
  const [jugador1, setJ1] = useState("");
  const [jugador2, setJ2] = useState("");
  const [sending, setSending] = useState(false);
  const canPlay = jugador1.trim() && jugador2.trim();

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#4a90e2";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  async function crear() {
    if (!canPlay || sending) return;
    setSending(true);
    try {
      const p = await crearPartida({ jugador1: jugador1.trim(), jugador2: jugador2.trim() });
      nav("/juego", { state: { partidaId: p.id } }); // solo id; nombres se leen del backend
    } catch (e) {
      alert(e.message || "No se pudo crear la partida");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page">
      <style>{`
        :root { color-scheme: light; }
        .page{
          position:fixed; inset:0; display:grid; place-items:center;
          background:#4a90e2; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
          padding:16px;
        }
        .card{
          background:#fff; border-radius:15px; padding:40px;
          box-shadow:0 4px 8px rgba(0,0,0,.2);
          width:min(420px, 100%); color:#111827;
        }
        .title{ margin:0 0 10px; font-weight:800; font-size:28px; color:#333; text-align:center; }
        .subtitle{ margin:0 0 30px; color:#666; text-align:center; }
        .label{ display:block; font-weight:700; color:#333; margin:0 0 6px; }
        .input{
          width:100%; height:44px; padding:0 12px; box-sizing:border-box;
          border:2px solid #d0d7de; border-radius:8px; background:#fff; color:#111827; outline:none;
        }
        .input::placeholder{ color:#9aa0a6; opacity:1; }
        .input:focus{ border-color:#2563eb; }
        .actions{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:4px; }
        .btn{
          height:44px; padding:0 18px; border:none; border-radius:8px; font-weight:800; color:#fff; cursor:pointer;
        }
        .btn-green{ background:#28a745; }
        .btn-blue{ background:#007bff; }
        .btn[disabled]{ background:#cbd5e1; cursor:not-allowed; }

        /* Responsivo */
        @media (max-width: 480px){
          .card{ padding:20px; }
          .title{ font-size:22px; }
        }
      `}</style>

      <div className="card">
        <h1 className="title">🔢 Adivina el Número</h1>
        <p className="subtitle">Del 1 al 100</p>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="j1" className="label">Jugador 1:</label>
          <input id="j1" className="input" placeholder="Escribe tu nombre…" value={jugador1} onChange={e=>setJ1(e.target.value)} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="j2" className="label">Jugador 2:</label>
          <input id="j2" className="input" placeholder="Escribe tu nombre…" value={jugador2} onChange={e=>setJ2(e.target.value)} />
        </div>

        <div className="actions">
          <button className="btn btn-green" onClick={crear} disabled={!canPlay || sending}>
            {sending ? "Guardando…" : "Jugar"}
          </button>
          <button className="btn btn-blue" onClick={()=>nav("/historial")}>Historial</button>
        </div>
      </div>
    </div>
  );
}
