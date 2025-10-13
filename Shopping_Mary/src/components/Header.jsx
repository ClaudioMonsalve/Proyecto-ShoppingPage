import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function Header({ carrito }) {
  const navigate = useNavigate();

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

      {/* Carrito */}
      <div>
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
      </div>
    </header>
  );
}
