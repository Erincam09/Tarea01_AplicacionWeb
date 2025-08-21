import { useEffect, useState } from "react";

export default function App() {
  const [mensaje, setMensaje] = useState("cargando...");
  const [texto, setTexto] = useState("");
  const [eco, setEco] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/hello");      // ← pasa por proxy
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMensaje(data.message);
      } catch (e) {
        setMensaje(`Error al conectar (Error: ${e.message})`);
      }
    })();
  }, []);

  const enviarEcho = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEco(data.recibido);
      setTexto("");
    } catch {
      setEco("Error al enviar");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>React + Express</h1>
      <p><strong>Mensaje del backend:</strong> {mensaje}</p>
      <hr />
      <form onSubmit={enviarEcho}>
        <label>
          Texto para /api/echo:{" "}
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe algo" />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Enviar</button>
      </form>
      {eco !== null && <p style={{ marginTop: 12 }}><strong>Echo del backend:</strong> {String(eco)}</p>}
    </div>
  );
}
