import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPartida } from "../api";

/*
  Pantalla de inicio donde escribo los nombres de los dos jugadores.
  Solo activo el botón “Jugar” cuando ambos campos tienen texto.
  Al crear la partida llamo al backend y, si todo sale bien, navego al juego pasando el id.
*/
export default function Menu() {
  const navegar = useNavigate();

  const [nombreJugador1, setNombreJugador1] = useState("");
  const [nombreJugador2, setNombreJugador2] = useState("");
  const [estaGuardando, setEstaGuardando] = useState(false);

  const puedeJugar = nombreJugador1.trim() && nombreJugador2.trim(); // Valida que no hayan textos en blanco

  /*
    Creo la partida en el backend con los dos nombres.
    Primero marco que estoy guardando para deshabilitar el botón.
    Si la creación funciona, me voy a /juego con el id de la partida.
    Si hay error, muestro un alert simple y vuelvo a habilitar el botón.
  */
  async function crearPartidaYEntrar() {
    if (!puedeJugar || estaGuardando) return;

    setEstaGuardando(true);
    try {
      const partida = await crearPartida({
        jugador1: nombreJugador1.trim(),
        jugador2: nombreJugador2.trim(),
      });
      navegar("/juego", { state: { partidaId: partida.id } });
    } catch (error) {
      alert(error.message || "No se pudo crear la partida");
    } finally {
      setEstaGuardando(false);
    }
  }

  const estiloPagina = {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "#4a90e2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  };
  const tarjeta = {
    background: "#fff",
    borderRadius: 15,
    padding: 40,
    boxShadow: "0 4px 8px rgba(0,0,0,.2)",
    width: 420,
    color: "#111827",
  };
  const titulo = {
    margin: 0,
    marginBottom: 10,
    fontWeight: 800,
    fontSize: 28,
    color: "#333",
    textAlign: "center",
  };
  const subtitulo = { margin: 0, marginBottom: 30, color: "#666", textAlign: "center" };
  const etiqueta = { display: "block", fontWeight: 700, color: "#333", marginBottom: 6 };
  const campo = {
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
  const acciones = { display: "flex", gap: 12, justifyContent: "center" };

  /*
    Devuelvo un objeto de estilos para un botón con el color de fondo que me pasen.
    Lo uso para no repetir las mismas propiedades cada vez que dibujo un botón.
    Entrada: colorFondo (string con un color tipo #28a745).
    Salida: objeto de estilos listo para usar en el atributo style.
  */
  function estiloBoton(colorFondo) {
    return {
      height: 44,
      padding: "0 18px",
      border: "none",
      borderRadius: 8,
      fontWeight: 800,
      color: "#fff",
      background: colorFondo,
      cursor: "pointer",
    };
  }

  return (
    <div style={estiloPagina}>
      <div style={tarjeta}>
        <h1 style={titulo}>🔢 Adivina el Número</h1>
        <p style={subtitulo}>Del 1 al 100</p>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="jugador1" style={etiqueta}>Jugador 1:</label>
          <input
            id="jugador1"
            style={campo}
            placeholder="Escribe tu nombre…"
            value={nombreJugador1}
            onChange={(e) => setNombreJugador1(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#d0d7de")}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label htmlFor="jugador2" style={etiqueta}>Jugador 2:</label>
          <input
            id="jugador2"
            style={campo}
            placeholder="Escribe tu nombre…"
            value={nombreJugador2}
            onChange={(e) => setNombreJugador2(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#d0d7de")}
          />
        </div>

        <div style={acciones}>
          <button
            onClick={crearPartidaYEntrar}
            disabled={!puedeJugar || estaGuardando}
            style={{
              ...estiloBoton("#28a745"),
              background: !puedeJugar || estaGuardando ? "#cbd5e1" : "#28a745",
              cursor: !puedeJugar || estaGuardando ? "not-allowed" : "pointer",
            }}
          >
            {estaGuardando ? "Guardando…" : "Jugar"}
          </button>

          <button
            onClick={() => navegar("/historial")}
            style={estiloBoton("#007bff")}
          >
            Historial
          </button>
        </div>
      </div>
    </div>
  );
}
