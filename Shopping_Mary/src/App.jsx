import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import Success from "./pages/success";
import TrackPedido from "./pages/track";

function App() {
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  return (
    <Router>
      <Header carrito={carrito} usuario={usuario} setUsuario={setUsuario} />

      <Routes>
        <Route path="/" element={<Home carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/carrito" element={<Carrito carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/perfil" element={<Perfil usuario={usuario} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/success" element={<Success setCarrito={setCarrito} />} />
        <Route path="/track" element={<TrackPedido />} />
      </Routes>
    </Router>
  );
}

export default App;
