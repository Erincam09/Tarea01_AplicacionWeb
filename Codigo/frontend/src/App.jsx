import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu.jsx";
import Juego from "./pages/Juego.jsx";
import Historial from "./pages/Historial.jsx"; // simple

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
