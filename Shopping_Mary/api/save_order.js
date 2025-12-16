// /api/save_order.js
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

console.log("🟣 save_order.js cargado");

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("⚠️ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido (usa POST)" });
  }

  try {
    const body = req.body;
    console.log("📦 Body recibido:", body);

    const {
      email,
      telefono,
      direccion,
      ciudad,
      region,
      total,
      carrito,
      estado_pago = "pagado", // 👈 nuevo campo (pago)
      metodo_pago = "debito", // 👈 nuevo campo (tipo)
    } = body || {};

    if (!email || !carrito?.length) {
      console.log("⚠️ Faltan datos:", { email, carrito });
      return res.status(400).json({ error: "Faltan datos para guardar el pedido" });
    }

    // Token de seguimiento
    const tracking_token = crypto.randomBytes(16).toString("hex");

    // 🧾 Insertar pedido principal
    console.log("🟢 Insertando pedido...");
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
          estado: "pendiente",  // 👈 estado del pedido (ej: pendiente, enviado, entregado)
          estado_pago,          // 👈 estado del pago (pagado o pendiente)
          metodo_pago,          // 👈 método de pago
          tracking_token,
        },
      ])
      .select()
      .single();

    if (pedidoError) {
      console.error("❌ Error insertando pedido:", pedidoError);
      throw pedidoError;
    }

    // 🧺 Insertar detalle
    console.log("🟢 Insertando detalle...");
    const detalle = carrito.map((p) => ({
      pedido_id: pedido.id,
      producto_id: p.id,
      cantidad: p.cantidad,
      subtotal: p.precio * p.cantidad,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedidos")
      .insert(detalle);

    if (detalleError) {
      console.error("❌ Error insertando detalle:", detalleError);
      throw detalleError;
    }

    console.log("✅ Pedido guardado correctamente:", pedido.id);
    return res.status(200).json({ success: true, pedido });
  } catch (err) {
    console.error("🔥 Error en save_order:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
