import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import Success from "./pages/success";

function App() {
  // Recupera carrito del localStorage al cargar
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : [];
  });

  const [usuario, setUsuario] = useState(null); // null = no ingresado

  // Cada vez que carrito cambie, guardarlo en localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  return (
    <Router>
      {/* Header recibe carrito y usuario */}
      <Header carrito={carrito} usuario={usuario} setUsuario={setUsuario} />

      {/* Rutas principales */}
      <Routes>
        <Route path="/" element={<Home carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/carrito" element={<Carrito carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/perfil" element={<Perfil usuario={usuario} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/success" element={<Success />} /> 
      </Routes>
    </Router>
  );
}

export default App;
