// /api/save_pedido.js
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Usa tus mismas variables:
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

console.log("🔍 Supabase URL:", supabaseUrl ? "✅ existe" : "❌ falta");
console.log("🔍 Supabase Key:", supabaseServiceKey ? "✅ existe" : "❌ falta");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const { email, telefono, direccion, ciudad, region, total, carrito } = req.body;

    console.log("🟡 Datos recibidos:", req.body);

    if (!email || !carrito?.length)
      return res.status(400).json({ error: "Faltan datos" });

    const tracking_token = crypto.randomBytes(16).toString("hex");

    // Guardar pedido
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

    if (pedidoError) {
      console.error("❌ Error insertando pedido:", pedidoError);
      throw pedidoError;
    }

    console.log("✅ Pedido insertado:", pedido);

    // Guardar detalle
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

    console.log("✅ Detalle guardado correctamente");

    return res.status(200).json({ success: true, pedido });
  } catch (err) {
    console.error("🔥 Error general:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
