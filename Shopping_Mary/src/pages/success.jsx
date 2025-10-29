import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import crypto from "crypto";

export default function Success({ setCarrito }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("status");
    const email = query.get("email");
    const telefono = query.get("telefono");
    const direccion = query.get("direccion");
    const ciudad = query.get("ciudad");
    const region = query.get("region");

    // 🧩 Validar estado del pago
    if (status !== "approved") {
      setError("El pago no fue aprobado.");
      navigate("/");
      return;
    }

    // 🧩 Verificar carrito
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (!carrito.length) {
      setError("No se encontró información del carrito.");
      navigate("/");
      return;
    }

    async function guardarPedido() {
      try {
        setLoading(true);

        // 🧮 Calcular total
        const total = carrito.reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );

        // 🧾 Crear tracking token único
        const tracking_token = crypto.randomBytes(32).toString("hex");

        // 📦 Guardar pedido principal
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

        // 🧺 Guardar detalle del pedido
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

        console.log("✅ Pedido guardado correctamente:", pedido.id);

        // ✉️ Enviar correo de confirmación con link de seguimiento
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

        // 🧹 Limpiar carrito y redirigir al Home
        setCarrito([]);
        localStorage.removeItem("carrito");
        navigate("/");
      } catch (err) {
        console.error("❌ Error guardando pedido:", err);
        setError("Error al guardar el pedido.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    guardarPedido();
  }, [location.search, navigate, setCarrito]);

  if (loading)
    return <p style={{ textAlign: "center" }}>Procesando pago...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return null;
}


