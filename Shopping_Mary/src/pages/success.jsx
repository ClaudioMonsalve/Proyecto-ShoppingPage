import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Success({ setCarrito }) {
  const location = useLocation();

  const [guardando, setGuardando] = useState(true);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const email = query.get("email");
    const telefono = query.get("telefono");
    const direccion = query.get("direccion");
    const ciudad = query.get("ciudad");
    const region = query.get("region");

    if (status !== "approved") {
      setError("Pago no aprobado");
      setGuardando(false);
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (!carrito.length) {
      setError("No se encontró el carrito");
      setGuardando(false);
      return;
    }

    async function guardarPedido() {
      try {
        setGuardando(true);
        const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

        const res = await fetch("/api/save_pedido", {
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
        if (!res.ok || !data.success) throw new Error(data.error || "Error al guardar el pedido");

        setPedido(data.pedido);

        // Vaciar carrito
        setCarrito([]);
        localStorage.removeItem("carrito");
      } catch (err) {
        console.error("❌ Error al guardar:", err);
        setError(err.message);
      } finally {
        setGuardando(false);
      }
    }

    guardarPedido();
  }, [location.search, setCarrito]);

  if (guardando)
    return <div style={st.wrap}><h1>Procesando pago...</h1></div>;
  if (error)
    return <div style={st.wrap}><h1>Error:</h1><p>{error}</p><Link to="/">Volver al inicio</Link></div>;

  if (!pedido)
    return <div style={st.wrap}><h1>No se pudo cargar el pedido</h1></div>;

  return (
    <div style={st.wrap}>
      <div style={st.card}>
        <h1>✅ ¡Pago aprobado!</h1>
        <p>Tu pedido ha sido confirmado.</p>
        <p><strong>Total:</strong> ${pedido.total}</p>
        <p><strong>Correo:</strong> {pedido.email}</p>
        <p><strong>Dirección:</strong> {pedido.direccion}, {pedido.ciudad}, {pedido.region}</p>

        <a href={`/track?token=${pedido.tracking_token}`} style={st.btn}>Ver seguimiento</a>
        <div style={{ marginTop: 12 }}>
          <Link to="/" style={st.link}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

const st = {
  wrap: { textAlign: "center", padding: "50px", color: "#fff" },
  card: { background: "#111", borderRadius: "12px", padding: "20px", display: "inline-block" },
  btn: { background: "#ff5c8d", color: "#fff", padding: "10px 15px", borderRadius: "8px", textDecoration: "none" },
  link: { color: "#ccc", textDecoration: "underline" },
};
