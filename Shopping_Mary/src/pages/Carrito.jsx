import React, { useState } from "react";

export default function Carrito({ carrito, setCarrito }) {
  const [loading, setLoading] = useState(false);

  const eliminarProducto = id => {
    setCarrito(carrito.filter(producto => producto.id !== id));
  };

  const total = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  const pagar = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");

    setLoading(true);

    const items = carrito.map(producto => ({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
    }));

    try {
      const res = await fetch("http://localhost:3000/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      console.log("👉 init_point recibido:", data.init_point);

      if (data.init_point) {
        window.location.href = data.init_point; // Redirige al checkout
      } else {
        alert("❌ Error al generar la preferencia de pago");
      }
    } catch (err) {
      console.error("❌ Error al procesar el pago:", err);
      alert("❌ Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "white" }}>Carrito</h2>

      {carrito.length === 0 ? (
        <p style={{ color: "white" }}>Tu carrito está vacío</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {carrito.map(producto => (
            <div
              key={producto.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                padding: "10px 15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                color: "black",
              }}
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ width: "60px", borderRadius: "6px" }}
              />
              <span style={{ flex: 1, marginLeft: "15px" }}>{producto.nombre}</span>
              <span style={{ margin: "0 25px 0 15px" }}>
                Cantidad: {producto.cantidad}
              </span>
              <span style={{ marginRight: "25px" }}>
                Subtotal: ${producto.precio * producto.cantidad}
              </span>
              <button
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
                onClick={() => eliminarProducto(producto.id)}
              >
                Eliminar
              </button>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: "10px", color: "white" }}>
            <h3>Total: ${total}</h3>
            <button
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                backgroundColor: "#646cff",
                color: "white",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={pagar}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Pagar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


