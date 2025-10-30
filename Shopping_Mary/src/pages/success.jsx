import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Success({ setCarrito }) {
  const location = useLocation();
  const [estado, setEstado] = useState("procesando"); // procesando | exito | error
  const [pedido, setPedido] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const email = query.get("email");
    const telefono = query.get("telefono");
    const direccion = query.get("direccion");
    const ciudad = query.get("ciudad");
    const region = query.get("region");

    // ⚠️ Validar pago
    if (status !== "approved") {
      setEstado("error");
      setMensajeError("El pago no fue aprobado.");
      return;
    }

    // ⚙️ Recuperar carrito del almacenamiento local
    const carrito = JSON.parse(localStorage.getItem("carrito_backup") || "[]");

    // 🧮 Calcular total y enviar al backend
    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

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
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Error al guardar el pedido.");
        }

        // 🧹 Vaciar carrito local
        setCarrito([]);
        // Limpiar copia del carrito
        localStorage.removeItem("carrito_backup");


        // ✅ Guardar información para mostrar
        setPedido(data.pedido);
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
        <h1 style={st.title}>Procesando pago...</h1>
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
          <h1 style={st.title}>✅ ¡Pago confirmado!</h1>
          <p><strong>Pedido #{pedido.id}</strong></p>
          <p>Total: ${pedido.total}</p>
          <p>
            Dirección: {pedido.direccion}, {pedido.ciudad}, {pedido.region}
          </p>
          <a href={trackUrl} target="_blank" rel="noreferrer" style={st.btn}>
            Ver seguimiento del pedido
          </a>
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
  title: {
    marginBottom: "10px",
  },
  btn: {
    display: "inline-block",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "#fff",
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  link: {
    color: "#aaa",
    textDecoration: "underline",
  },
};
