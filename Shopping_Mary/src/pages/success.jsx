import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Success({ setCarrito }) {
  const location = useLocation();
  const [estado, setEstado] = useState("procesando"); // procesando | exito | error
  const [pedido, setPedido] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const email = query.get("email");
    const telefono = query.get("telefono");
    const direccion = query.get("direccion");
    const ciudad = query.get("ciudad");
    const region = query.get("region");

    const carrito = JSON.parse(localStorage.getItem("carrito_backup") || "[]");
    if (!carrito.length) {
      setEstado("error");
      setMensajeError("No se encontró información del carrito.");
      return;
    }

    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

    // 🔍 Detectar método de pago
    if (status === "approved") {
      setMetodoPago("debito");
    } else if (status === "no_pagado") {
      setMetodoPago("efectivo");
    } else {
      setEstado("error");
      setMensajeError("El pago no fue aprobado.");
      return;
    }

    async function guardarPedido() {
      try {
        const res = await fetch("/api/save_order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            telefono,
            direccion,
            ciudad,
            region,
            total,
            carrito,
            estado_pago: status === "no_pagado" ? "pendiente" : "pagado", // 👈 estado del pago
            metodo_pago: status === "no_pagado" ? "efectivo" : "debito", // 👈 método del pago
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Error al guardar el pedido.");
        }

        const pedido = data.pedido;

        // ✉️ Enviar correo solo si el pago fue aprobado
        if (status === "approved") {
          try {
            await fetch("/api/send_confirmacion", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                pedido_id: pedido.id,
                total: pedido.total,
                direccion: pedido.direccion,
                ciudad: pedido.ciudad,
                region: pedido.region,
                tracking_token: pedido.tracking_token,
              }),
            });
          } catch (mailErr) {
            console.warn("⚠️ Falló el envío del correo:", mailErr);
          }
        }

        // 🧹 Limpiar carrito
        setCarrito([]);
        localStorage.removeItem("carrito_backup");

        setPedido(pedido);
        setEstado("exito");
      } catch (err) {
        console.error("❌ Error al guardar pedido:", err);
        setMensajeError(err.message);
        setEstado("error");
      }
    }

    guardarPedido();
  }, [location.search, setCarrito]);

  // =======================
  // 🎨 Render
  // =======================
  if (estado === "procesando") {
    return (
      <div style={st.wrap}>
        <h1 style={st.title}>Procesando pedido...</h1>
        <p>Por favor espera unos segundos.</p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div style={st.wrap}>
        <h1 style={{ ...st.title, color: "#ff4d4f" }}>❌ Algo salió mal</h1>
        <p>{mensajeError}</p>
        <Link to="/" style={st.btn}>Volver al inicio</Link>
      </div>
    );
  }

  if (estado === "exito" && pedido) {
    const trackUrl = `${window.location.origin}/track?token=${pedido.tracking_token}`;
    return (
      <div style={st.wrap}>
        <div style={st.card}>
          {metodoPago === "debito" ? (
            <>
              <h1 style={st.title}>✅ ¡Pago confirmado!</h1>
              <p><strong>Pedido #{pedido.id}</strong></p>
              <p>Total: ${pedido.total}</p>
              <p>Dirección: {pedido.direccion}, {pedido.ciudad}, {pedido.region}</p>
              <a href={trackUrl} target="_blank" rel="noreferrer" style={st.btn}>
                Ver seguimiento del pedido
              </a>
            </>
          ) : (
            <>
              <h1 style={{ ...st.title, color: "#ffb347" }}>🕓 Pedido pendiente de pago</h1>
              <p><strong>Pedido #{pedido.id}</strong></p>
              <p>Total: ${pedido.total}</p>
              <p>Por favor paga en efectivo al momento de la entrega.</p>
              <p>Dirección: {pedido.direccion}, {pedido.ciudad}, {pedido.region}</p>
              <a href={trackUrl} target="_blank" rel="noreferrer" style={st.btn}>
                Ver seguimiento del pedido
              </a>
            </>
          )}

          <div style={{ marginTop: 10 }}>
            <Link to="/" style={st.link}>Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const st = {
  wrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#fff",
  },
  card: {
    background: "#111",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 0 20px rgba(255,92,141,0.2)",
  },
  title: { marginBottom: "10px" },
  btn: {
    display: "inline-block",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "#fff",
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  link: { color: "#aaa", textDecoration: "underline" },
};
