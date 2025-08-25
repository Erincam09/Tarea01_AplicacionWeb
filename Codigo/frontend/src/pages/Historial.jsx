import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPartidas } from "../api";

/*
  Muestro una tabla simple con el historial de partidas terminadas. Apenas se monta este componente
  le pido la lista al backend, la ordeno por fecha (más nuevas primero) y la guardo en estado.
  Si algo falla muestro un mensaje de error. El botón “Menú” me lleva de vuelta a la pantalla principal.
*/
export default function Historial() {
  const navegar = useNavigate();

  const [partidas, setPartidas] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  /*
    Al montar cargo la lista de partidas terminadas desde el backend. Primero pongo el estado
    de cargando en true, limpio errores, pido los datos y luego ordeno por fecha de creación
    para que lo más reciente aparezca arriba. Pase lo que pase saco el estado
    de cargando al final.
  */
  useEffect(() => {
    (async () => {
      try {
        setEstaCargando(true);
        setMensajeError("");
        const lista = await listarPartidas();
        const listaOrdenada = (lista || [])
          .slice()
          .sort(function (a, b) {
            const aFecha = a.createdAt || 0;
            const bFecha = b.createdAt || 0;
            return bFecha - aFecha;
          });
        setPartidas(listaOrdenada);
      } catch (e) {
        setMensajeError(e && e.message ? e.message : "No se pudo listar el historial");
      } finally {
        setEstaCargando(false);
      }
    })();
  }, []);

  /*
    Dado un objeto de partida decido qué texto mostrar como ganador. Si viene “empate” lo digo tal cual.
    Si el backend marcó 1 o 2, devuelvo el nombre correspondiente. Si falta información, muestro “—”.
    Entradas: partida { ganador, jugador1, jugador2 }.
    Salida: string con el nombre del ganador, “Empate” o “—”.
  */
  function textoGanador(partida) {
    if (partida.ganador === "empate") 
      return "Empate";
    if (partida.ganador === 1) 
      return partida.jugador1 || "—";
    if (partida.ganador === 2) 
      return partida.jugador2 || "—";
    return "—";
  }

  /*
    Convierto milisegundos a un texto corto en segundos redondeados, agregando la “s” al final.
    Si viene null o undefined, prefiero mostrar “—” para que la tabla se vea consistente.
    Entradas: ms (número en milisegundos).
    Salida: string como “12s” o “—”.
  */
  function formatoTiempo(ms) {
    if (ms == null) return "—";
    return String(Math.round(ms / 1000)) + "s";
  }

  const estiloPagina = {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "#4a90e2",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  };
  const tarjeta = {
    background: "#fff", borderRadius: 12, padding: 20,
    boxShadow: "0 8px 16px rgba(0,0,0,.15)",
    width: 900, color: "#111827"
  };
  const encabezado = { display: "flex", alignItems: "center", justifyContent: "space-between" };
  const titulo = { margin: 0, fontSize: 20, color: "#111827" };
  const botonMenu = {
    height: 38, padding: "0 14px", background: "#007bff", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer"
  };
  const contenedorTabla = { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginTop: 12 };
  const tabla = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
  const th = { padding: "10px 12px", fontWeight: 700, color: "#111827", background: "#f3f4f6", textAlign: "left", borderBottom: "1px solid #e5e7eb" };
  const td = { padding: "10px 12px", color: "#111827", borderBottom: "1px solid #f1f5f9" };
  const filaAlterna = { background: "#fafafa" };

  return (
    <div style={estiloPagina}>
      <div style={tarjeta}>
        <div style={encabezado}>
          <h1 style={titulo}>Historial de partidas</h1>
          <button style={botonMenu} onClick={function(){ navegar("/"); }}>Menú</button>
        </div>

        {estaCargando && <div style={{ padding: 12 }}>Cargando…</div>}

        {!estaCargando && mensajeError && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#fee2e2", color: "#7f1d1d", border: "1px solid #fecaca" }}>
            {mensajeError}
          </div>
        )}

        {!estaCargando && !mensajeError && partidas.length === 0 && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", textAlign: "center" }}>
            No hay partidas para mostrar.
          </div>
        )}

        {!estaCargando && !mensajeError && partidas.length > 0 && (
          <div style={contenedorTabla}>
            <table style={tabla}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>Jugador 1</th>
                  <th style={th}>Intentos J1</th>
                  <th style={th}>Tiempo J1</th>
                  <th style={th}>Jugador 2</th>
                  <th style={th}>Intentos J2</th>
                  <th style={th}>Tiempo J2</th>
                  <th style={th}>Ganador</th>
                </tr>
              </thead>
              <tbody>
                {partidas.map(function (partida, indice) {
                  const n = indice + 1;
                  const intentosJ1 = (partida.totales && partida.totales.j1) ? partida.totales.j1.intentos : "—";
                  const tiempoJ1 = (partida.totales && partida.totales.j1 && partida.totales.j1.tiempoMs != null)
                    ? formatoTiempo(partida.totales.j1.tiempoMs) : "—";
                  const intentosJ2 = (partida.totales && partida.totales.j2) ? partida.totales.j2.intentos : "—";
                  const tiempoJ2 = (partida.totales && partida.totales.j2 && partida.totales.j2.tiempoMs != null)
                    ? formatoTiempo(partida.totales.j2.tiempoMs) : "—";
                  const ganador = textoGanador(partida);

                  return (
                    <tr key={partida.id} style={n % 2 === 0 ? filaAlterna : undefined}>
                      <td style={td}>#{String(n).padStart(2, "0")}</td>
                      <td style={td}>{partida.jugador1 || "—"}</td>
                      <td style={td}>{intentosJ1}</td>
                      <td style={td}>{tiempoJ1}</td>
                      <td style={td}>{partida.jugador2 || "—"}</td>
                      <td style={td}>{intentosJ2}</td>
                      <td style={td}>{tiempoJ2}</td>
                      <td style={td}>{ganador}</td>
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
