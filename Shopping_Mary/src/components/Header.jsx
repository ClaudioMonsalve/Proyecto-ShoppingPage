import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";

export default function Header({ carrito }) {
  const navigate = useNavigate();
  const [openPerfil, setOpenPerfil] = useState(false);

  // Contador total de productos en el carrito
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#242424",
        color: "white",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <FaHome size={28} />
        <h1 style={{ margin: 0 }}>E-Commerce</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Carrito */}
        <Link
          to="/carrito"
          style={{
            position: "relative",
            fontSize: "1.6rem",
            color: "white",
            textDecoration: "none",
          }}
        >
          🛒
          {totalProductos > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 7px",
                fontSize: "0.8rem",
                fontWeight: "bold",
              }}
            >
              {totalProductos}
            </span>
          )}
        </Link>

        {/* Perfil */}
        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={28}
            style={{ cursor: "pointer" }}
            onClick={() => setOpenPerfil(!openPerfil)}
          />
          {openPerfil && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "35px",
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <button
                style={{
                  display: "block",
                  padding: "10px 20px",
                  width: "100%",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/register")}
              >
                Registrarse
              </button>
              <button
                style={{
                  display: "block",
                  padding: "10px 20px",
                  width: "100%",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
