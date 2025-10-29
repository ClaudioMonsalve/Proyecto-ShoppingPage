import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Success({ setCarrito }) {
  const location = useLocation();

  const [guardando, setGuardando] = useState(true);
  const [error, setError] = useState("");
  const [pedidoGuardado, setPedidoGuardado] = useState(null);
  const [resumen, setResumen] = useState({ email: "", total: 0, direccion: "", ciudad: "", region: "" });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const email = query.get("email") || "";
    const telefono = query.get("telefono") || "";
    const direccion = query.get("direccion") || "";
    const ciudad = query.get("ciudad") || "";
    const region = query.get("region") || "";

    // Mostrar lo recibido para depurar
    console.log("🟡 Parámetros success:", { status, email, telefono, direccion, ciudad, region });

    if (status !== "approved") {
      setError("El pago no fue aprobado o faltan parámetros.");
      setGuardando(false);
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (!carrito.length) {
      setError("No se encontró información del carrito en este navegador.");
      setGuardando(false);
      return;
    }

    async function ejecutar() {
      try {
        setGuardando(true);

        const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
        setResumen({ email, total, direccion, ciudad, region });

        // Token de tracking compatible con navegador
        const tracking_token = self.crypto.randomUUID().replace(/-/g, "");

        // 1) Guardar pedido
        const { data: pedido, error: pedidoError } = await supabase
          .from("pedidos")
          .insert([
            {
              email,
              telefono,
              direccion,
              ciudad,
              region,
              total,
              estado: "pagado",
              tracking_token,
            },
          ])
          .select()
          .single();

        if (pedidoError) throw pedidoError;

        // 2) Guardar detalle
        const detalle = carrito.map((p) => ({
          pedido_id: pedido.id,
          producto_id: p.id,
          cantidad: p.cantidad,
          subtotal: p.precio * p.cantidad,
        }));

        const { error: detalleError } = await supabase
          .from("detalle_pedidos")
          .insert(detalle);

        if (detalleError) throw detalleError;

        // 3) Enviar correo de confirmación (no bloquea la UI si falla)
        try {
          await fetch("/api/send_confirmacion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              pedido_id: pedido.id,
              total,
              direccion,
              ciudad,
              region,
            }),
          });
        } catch (mailErr) {
          console.warn("⚠️ Falló el envío del correo, pero el pedido quedó guardado:", mailErr);
        }

        // 4) Vaciar carrito (sin redirigir)
        setCarrito?.([]);
        localStorage.removeItem("carrito");

        setPedidoGuardado(pedido);
        console.log("✅ Pedido guardado:", pedido);
      } catch (e) {
        console.error("❌ Error guardando pedido:", e);
        setError(e?.message || "Error al guardar el pedido.");
      } finally {
        setGuardando(false);
      }
    }

    ejecutar();
  }, [location.search, setCarrito]);

  // UI
  if (guardando) {
    return (
      <div style={st.wrap}>
        <h1 style={st.title}>Procesando pago...</h1>
        <p>Guardando pedido y enviando confirmación por correo.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={st.wrap}>
        <h1 style={{ ...st.title, color: "#e74c3c" }}>Algo salió mal</h1>
        <p style={{ color: "#e74c3c" }}>{error}</p>
        <Link to="/" style={st.btnSecondary}>Volver al inicio</Link>
      </div>
    );
  }

  if (!pedidoGuardado) {
    return (
      <div style={st.wrap}>
        <h1 style={st.title}>Sin datos de pedido</h1>
        <p>No se pudo obtener información del pedido.</p>
        <Link to="/" style={st.btnSecondary}>Volver al inicio</Link>
      </div>
    );
  }

  const trackUrl = `${window.location.origin}/track?token=${pedidoGuardado.tracking_token}`;

  return (
    <div style={st.wrap}>
      <div style={st.card}>
        <h1 style={st.title}>✅ ¡Pago aprobado!</h1>
        <p style={st.meta}>Pedido #{pedidoGuardado.id}</p>

        <div style={st.row}><span style={st.label}>Correo:</span><span>{resumen.email}</span></div>
        <div style={st.row}><span style={st.label}>Total:</span><span>${resumen.total}</span></div>
        <div style={st.row}><span style={st.label}>Dirección:</span><span>{resumen.direccion}, {resumen.ciudad}, {resumen.region}</span></div>

        <a href={trackUrl} target="_blank" rel="noreferrer" style={st.btnPrimary}>
          Ver seguimiento del pedido
        </a>
        <div style={{ height: 8 }} />
        <Link to="/" style={st.btnSecondary}>Volver al inicio</Link>
      </div>
    </div>
  );
}

const st = {
  wrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    padding: 24,
    color: "#fff",
    boxShadow: "0 0 20px rgba(255,92,141,.15)",
    textAlign: "center",
  },
  title: {
    margin: 0,
    marginBottom: 8,
  },
  meta: {
    opacity: 0.8,
    marginBottom: 16,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px dashed #333",
  },
  label: {
    opacity: 0.75,
  },
  btnPrimary: {
    display: "inline-block",
    padding: "10px 16px",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 700,
  },
  btnSecondary: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#2d2d2d",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 10,
    fontWeight: 600,
  },
};



