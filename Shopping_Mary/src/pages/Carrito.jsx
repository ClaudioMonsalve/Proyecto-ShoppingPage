import React, { useState, useEffect } from "react";

export default function Carrito({ carrito, setCarrito }) {
  const [loading, setLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);

  // Función para eliminar un producto del carrito
  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((producto) => producto.id !== id));
  };

  // Total del carrito
  const total = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  // Función para generar la preferencia en el backend
  const generarPreferencia = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");

    setLoading(true);

    const items = carrito.map((producto) => ({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
    }));

    try {
      const res = await fetch("/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      console.log("✅ Preferencia recibida:", data);

      if (data.preferenceId) {
        setPreferenceId(data.preferenceId); // Guardamos el preferenceId para el botón oficial
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

  // useEffect para inicializar el SDK de Mercado Pago y renderizar el botón oficial
  useEffect(() => {
    if (!preferenceId) return;

    // Crear el script del SDK
    const mpScript = document.createElement("script");
    mpScript.src = "https://sdk.mercadopago.com/js/v2";
    mpScript.async = true;

    mpScript.onload = () => {
      const mp = new window.MercadoPago("665879217034266", {
        locale: "es-CL",
      });

      mp.checkout({
        preference: {
          id: preferenceId,
        },
        render: {
          container: "#mp-button", // div donde se mostrará el botón oficial
          label: "Pagar con Mercado Pago",
        },
      });
    };

    document.body.appendChild(mpScript);

    // Cleanup: remover script al desmontar
    return () => {
      document.body.removeChild(mpScript);
    };
  }, [preferenceId]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "white" }}>Carrito</h2>

      {carrito.length === 0 ? (
        <p style={{ color: "white" }}>Tu carrito está vacío</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {carrito.map((producto) => (
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
              onClick={generarPreferencia}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Generar Pago"}
            </button>
          </div>

          {/* Aquí se renderiza el botón oficial de Mercado Pago */}
          <div id="mp-button" style={{ marginTop: "20px" }}></div>
        </div>
      )}
    </div>
  );
}
