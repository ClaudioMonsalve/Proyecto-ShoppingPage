import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Perfil from "./pages/Perfil";

function App() {
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null); // null = no ingresado

  return (
    <Router>
      {/* Header recibe carrito y estado de usuario */}
      <Header carrito={carrito} usuario={usuario} setUsuario={setUsuario} />

      {/* Rutas principales */}
      <Routes>
        <Route path="/" element={<Home carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/carrito" element={<Carrito carrito={carrito} setCarrito={setCarrito} />} />
        <Route path="/perfil" element={<Perfil usuario={usuario} />} />
      </Routes>
    </Router>
  );
}

export default App;
