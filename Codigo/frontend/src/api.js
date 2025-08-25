/*
  Creo una partida nueva en el backend mandando los dos nombres. Hago un POST a /api/partidas
  con { jugador1, jugador2 }. Si el servidor responde con error, arrojo una excepción simple
  para que el componente pueda mostrar un alert. Si todo va bien, devuelvo el JSON con los
  datos de la partida (incluye el id que luego uso para abrir la pantalla de juego).
*/
export async function crearPartida({ jugador1, jugador2 }) {
  const respuesta = await fetch("/api/partidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jugador1, jugador2 })
  });
  if (!respuesta.ok) throw new Error("No se pudo crear la partida");
  return respuesta.json();
}

/*
  Pido al backend el estado completo de una partida usando su id. Hago un GET a
  /api/partidas/id y, si todo sale bien, regreso el objeto con nombres, turno, ronda,
  intentos, rondas y totales. Si algo falla, lanzo un error para que el componente decida
  cómo avisar en pantalla.
*/
export async function obtenerPartida(idPartida) {
  const respuesta = await fetch(`/api/partidas/${idPartida}`);
  if (!respuesta.ok) 
    throw new Error("No se pudo obtener la partida");
  return respuesta.json();
}

/*
  Envío un intento al backend indicando quién juega y qué número propuso.
  Hago un POST a /api/partidas/id/intento con { jugador, numero }. El servidor me
  devuelve el nuevo estado (mensaje, turno siguiente, ronda actual, totales, si terminó,
  ganador y, si cerró la ronda, la lista de rondas). Si el POST falla, lanzo un error
  para que el componente muestre un mensaje claro.
*/
export async function enviarIntento(idPartida, datosIntento) {
  const respuesta = await fetch(`/api/partidas/${idPartida}/intento`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosIntento)
  });
  if (!respuesta.ok) 
    throw new Error("No se pudo enviar el intento");
  return respuesta.json();
}

/*
  Traigo el listado de partidas terminadas para poblar el historial.
  Hago un GET a /api/partidas y regreso el arreglo con las partidas tal cual llega. Si 
  algo sale mal, lanzo un error para que la pantalla de historial pueda mostrar un aviso sencillo.
*/
export async function listarPartidas() {
  const respuesta = await fetch("/api/partidas");
  if (!respuesta.ok) throw new Error("No se pudo listar el historial");
  return respuesta.json();
}
