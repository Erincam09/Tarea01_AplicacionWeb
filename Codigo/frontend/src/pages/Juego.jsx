import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerPartida, enviarIntento } from "../api";

/*
  Pantalla del juego. Recibo el id de la partida por el state del router, cargo los datos
  desde el backend y muestro el turno, los intentos y los mensajes. Cada intento lo mando
  al backend y con la respuesta actualizo todo (quién juega, ronda, totales y si terminó).
  Cuando el juego termina, enseño el resumen y un botón para volver al menú.
*/
export default function Juego() {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const estado = ubicacion.state;
  const idPartida = estado && estado.partidaId;

  const [nombreJugador1, setNombreJugador1] = useState("");
  const [nombreJugador2, setNombreJugador2] = useState("");
  const [turnoActual, setTurnoActual] = useState(1);
  const [numeroRonda, setNumeroRonda] = useState(1);
  const [numeroIngresado, setNumeroIngresado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [intentosJugador1, setIntentosJugador1] = useState(0);
  const [intentosJugador2, setIntentosJugador2] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [quienGano, setQuienGano] = useState(null);
  const [listaRondas, setListaRondas] = useState([]);
  const [totales, setTotales] = useState({ j1: { intentos: 0, tiempoMs: 0 }, j2: { intentos: 0, tiempoMs: 0 } });
  const [estaCargando, setEstaCargando] = useState(true);

  /*
    Al entrar a esta pantalla verifico que exista el id de la partida. Si no existe regreso al menú.
    Si sí existe, pido los datos al backend una sola vez: nombres, turno, ronda, intentos, estado,
    ganador, rondas y totales. Si hay algún problema muestro un mensaje básico.
  */
  useEffect(function () {
    if (!idPartida) {
      navegar("/");
      return;
    }
    async function cargar() {
      try {
        const p = await obtenerPartida(idPartida);
        setNombreJugador1(p.jugador1);
        setNombreJugador2(p.jugador2);
        setTurnoActual(p.turno !== undefined && p.turno !== null ? p.turno : 1);
        setNumeroRonda(p.rondaActual !== undefined && p.rondaActual !== null ? p.rondaActual : 1);
        setIntentosJugador1(p.intentosJugador1 || 0);
        setIntentosJugador2(p.intentosJugador2 || 0);
        setJuegoTerminado(!!p.terminado);
        setQuienGano(p.ganador !== undefined ? p.ganador : null);
        setListaRondas(p.rondas ? p.rondas : []);
        if (p.totales) setTotales(p.totales);
      } catch (e) {
        setMensaje("No se pudo cargar la partida");
      } finally {
        setEstaCargando(false);
      }
    }
    cargar();
  }, [idPartida, navegar]);

  /*
    Actualizo el número que la persona va escribiendo en el input. Guardo el valor original
    porque las validaciones las hago justo antes de enviar el intento al backend.
  */
  function cambiarNumero(e) {
    setNumeroIngresado(e.target.value);
  }

  /*
    Permito enviar con Enter para que el flujo sea rápido. Si la tecla es Enter llamo directo
    a la función que manda el intento al backend.
  */
  function teclaPresionada(e) {
    if (e.key === "Enter") {
      enviarIntentoDeJugador();
    }
  }

  /*
    Envío un intento al backend con el número que puso la persona y el jugador del turno.
    Si el número no es válido aviso con un mensaje. Si la petición funciona, uso la respuesta
    del backend para actualizar todo: intentos, turno, ronda, totales, lista de rondas. 
    También limpio el input para el siguiente intento.
  */
  async function enviarIntentoDeJugador() {
    if (!numeroIngresado) return;
    const numero  = parseInt(numeroIngresado, 10);
    if (isNaN(numero ) || numero  < 1 || numero  > 100) {
      setMensaje("Ingresa un número entre 1 y 100");
      return;
    }
    try {
      const resp = await enviarIntento(idPartida, { jugador: turnoActual, numero});
      setMensaje(resp.mensaje || "");
      setIntentosJugador1(resp.intentosJugador1);
      setIntentosJugador2(resp.intentosJugador2);
      setTurnoActual(resp.turnoSiguiente !== undefined && resp.turnoSiguiente !== null ? resp.turnoSiguiente : turnoActual);
      setNumeroRonda(resp.rondaActual !== undefined && resp.rondaActual !== null ? resp.rondaActual : numeroRonda);
      if (resp.totales) setTotales(resp.totales);
      if (resp.rondaTerminada && resp.rondas) setListaRondas(resp.rondas);
      if (resp.terminado) {
        setJuegoTerminado(true);
        setQuienGano(resp.ganador);
      }
      setNumeroIngresado("");
    } catch (e) {
      setMensaje(e.message || "Error al intentar");
    }
  }

  const nombreGanador =
    quienGano === "empate"
      ? "Empate"
      : (quienGano === 1 ? nombreJugador1 : nombreJugador2);

  if (estaCargando) {
    return <div style={{ padding: 24 }}>Cargando…</div>;
  }

  const estiloPagina = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "#4a90e2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  };
  const tarjetaJuego = {
    background: "#fff", borderRadius: 18, padding: 28,
    boxShadow: "0 12px 28px rgba(0,0,0,.18)", width: 700, color: "#111827"
  };
  const cabecera = { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 };
  const titulo = { margin: 0, fontSize: 24, color: "#111827" };
  const zonaJugadores = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0 12px" };
  const chipBase = { background: "#f3f4f6", borderRadius: 12, padding: "10px 12px" };
  const cajaMensaje = {
    margin: "0 0 12px", background: "#fff8db", color: "#7a5c00",
    border: "1px solid #ffeaa7", borderRadius: 12, padding: "10px 12px", fontSize: 14, textAlign: "left"
  };
  const zonaAcciones = { display: "flex", justifyContent: "center", alignItems: "center", gap: 10 };
  const campoNumero = {
    width: 220, height: 46, padding: "0 12px", boxSizing: "border-box",
    border: "2px solid #d0d7de", borderRadius: 12, background: "#fff",
    color: "#111827", outline: "none", textAlign: "center"
  };
  const botonIntentar = {
    height: 46, padding: "0 18px", border: "none", borderRadius: 12,
    fontSize: 15, fontWeight: 800, color: "#fff", background: "#22c55e", cursor: "pointer"
  };

  /*
    Armo un estilo para la franja de “ganador” o “empate”. Si es empate uso grises y si 
    hay ganador uso verdes. Devuelvo los estilos como un objeto para poder aplicarlos directamente.
  */
  function estiloGanador(esEmpate) {
    return {
      margin: "6px 0 14px",
      background: esEmpate ? "#e5e7eb" : "#d1fae5",
      color: esEmpate ? "#374151" : "#065f46",
      border: "1px solid " + (esEmpate ? "#e5e7eb" : "#a7f3d0"),
      padding: "10px 12px", borderRadius: 12, textAlign: "center", fontWeight: 800
    };
  }

  const totalesGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 };
  const tarjetaTotal = { background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: 14, textAlign: "center" };
  const contTabla = { border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" };
  const estiloTH = { padding: "10px 12px", fontWeight: 800, color: "#111827", borderRight: "1px solid #e5e7eb", whiteSpace: "nowrap", textAlign: "left" };
  const estiloTD = { padding: "10px 12px", color: "#111827", borderRight: "1px solid #f1f5f9", whiteSpace: "nowrap" };

  return (
    <div style={estiloPagina}>
      <style>{`.rondas tbody tr:nth-child(odd){ background:#fafafa }`}</style>

      <div style={tarjetaJuego}>
        <div style={cabecera}>
          <span aria-hidden="true" style={{ fontSize: 22 }}>🎲</span>
          <h1 style={titulo}>Adivina el Número (1–100)</h1>
        </div>

        <div style={zonaJugadores}>
          <div
            style={{
              background: chipBase.background,
              borderRadius: chipBase.borderRadius,
              padding: chipBase.padding,
              textAlign: "left",
              color: (turnoActual === 1) ? "#16a34a" : "#6b7280",
              fontWeight: (turnoActual === 1) ? 700 : 500
            }}
          >
            {nombreJugador1} — intentos: {intentosJugador1}
          </div>

          <div
            style={{
              background: chipBase.background,
              borderRadius: chipBase.borderRadius,
              padding: chipBase.padding,
              textAlign: "right",
              color: (turnoActual === 2) ? "#16a34a" : "#6b7280",
              fontWeight: (turnoActual === 2) ? 700 : 500
            }}
          >
            {nombreJugador2} — intentos: {intentosJugador2}
          </div>
        </div>

        {!juegoTerminado && (
          <div>
            <p style={{ margin: "0 0 14px", color: "#6b7280", textAlign: "center" }}>
              Ronda <b>{numeroRonda}</b> de 6 — Turno de <b>{turnoActual === 1 ? nombreJugador1 : nombreJugador2}</b>
            </p>

            {mensaje ? <div style={cajaMensaje}>{mensaje}</div> : null}

            <div style={zonaAcciones}>
              <input
                type="number"
                min={1}
                max={100}
                placeholder="1 a 100"
                value={numeroIngresado}
                onChange={cambiarNumero}
                onKeyDown={teclaPresionada}
                style={campoNumero}
                onFocus={function(e){ e.target.style.borderColor = "#2563eb"; }}
                onBlur={function(e){ e.target.style.borderColor = "#d0d7de"; }}
              />
              <button style={botonIntentar} onClick={enviarIntentoDeJugador}>Intentar</button>
            </div>
          </div>
        )}

        {juegoTerminado && (
          <div style={{ marginTop: 4 }}>
            <div style={estiloGanador(quienGano === "empate")}>
              {quienGano === "empate" ? "Resultado: Empate" : "Resultado: ¡Gana " + (quienGano === 1 ? nombreJugador1 : nombreJugador2) + "!"}
            </div>

            <div style={totalesGrid}>
              <div style={tarjetaTotal}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{nombreJugador1}</div>
                <div>Intentos: <b>{totales.j1 ? totales.j1.intentos : 0}</b></div>
                <div>Tiempo: <b>{totales.j1 ? Math.round((totales.j1.tiempoMs || 0) / 1000) : 0}s</b></div>
              </div>
              <div style={tarjetaTotal}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{nombreJugador2}</div>
                <div>Intentos: <b>{totales.j2 ? totales.j2.intentos : 0}</b></div>
                <div>Tiempo: <b>{totales.j2 ? Math.round((totales.j2.tiempoMs || 0) / 1000) : 0}s</b></div>
              </div>
            </div>

            <div style={contTabla}>
              <table className="rondas" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={estiloTH}>Ronda</th>
                    <th style={estiloTH}>Adivinó</th>
                    <th style={estiloTH}>Intentos</th>
                    <th style={{ padding: "10px 12px", fontWeight: 800, color: "#111827", whiteSpace: "nowrap", textAlign: "left" }}>Tiempo (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {listaRondas && listaRondas.length > 0 ? (
                    listaRondas.map(function (ronda, indice) {
                      const clave = ronda && ronda.n ? ronda.n : indice;
                      const nombre = ronda && ronda.adivinador === 1 ? nombreJugador1 : nombreJugador2;
                      const intentos = ronda ? ronda.intentos : 0;
                      const segundos = ronda ? Math.round((ronda.duracionMs || 0) / 1000) : 0;
                      return (
                        <tr key={clave} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={estiloTD}>{ronda ? ronda.n : "-"}</td>
                          <td style={estiloTD}>{nombre}</td>
                          <td style={estiloTD}>{intentos}</td>
                          <td style={{ padding: "10px 12px", color: "#111827", whiteSpace: "nowrap" }}>{segundos}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td style={{ padding: 14 }} colSpan={4}>No hay datos de rondas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button
                onClick={function(){ navegar("/"); }}
                style={{ height: 46, padding: "0 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer" }}
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
