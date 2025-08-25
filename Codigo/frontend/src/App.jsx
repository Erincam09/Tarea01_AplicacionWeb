import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu.jsx";
import Juego from "./pages/Juego.jsx";
import Historial from "./pages/Historial.jsx";

/*
  Defino las rutas principales de la aplicación. Uso el router para moverme
  entre la pantalla de inicio (Menu), la pantalla del juego y el
  historial. Cada pantalla se encarga de pedir sus datos al backend cuando lo necesita. 
  Mantengo las rutas cortas y claras: “/” para empezar, “/juego” para jugar y “/historial” 
  para ver las partidas terminadas.
*/
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/juego" element={<Juego />} />
        <Route path="/historial" element={<Historial />} />
      </Routes>
    </BrowserRouter>
  );
}
