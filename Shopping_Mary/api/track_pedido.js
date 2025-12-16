// /api/track_pedido.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método no permitido (usa GET)" });

  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Falta token de seguimiento" });

    // 🧾 Buscar el pedido principal por tracking_token
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select(
        `
        id,
        email,
        total,
        estado,        
        estado_pago, 
        metodo_pago,  
        direccion,
        ciudad,
        region,
        created_at
      `
      )
      .eq("tracking_token", token)
      .single();

    if (pedidoError || !pedido) {
      console.error("⚠️ Pedido no encontrado:", pedidoError);
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // 🧺 Obtener los productos del pedido
    const { data: items, error: itemsError } = await supabase
      .from("detalle_pedidos")
      .select(`
        id,
        cantidad,
        subtotal,
        producto:productos(nombre, precio)
      `)
      .eq("pedido_id", pedido.id);

    if (itemsError) {
      console.error("❌ Error al obtener detalle:", itemsError);
      throw itemsError;
    }

    const detalle = (items || []).map((i) => ({
      id: i.id,
      nombre: i.producto?.nombre || "Producto desconocido",
      cantidad: i.cantidad,
      precio: i.producto?.precio || 0,
      subtotal: i.subtotal,
    }));

    // ✅ Respuesta final
    return res.status(200).json({
      success: true,
      pedido: {
        id: pedido.id,
        email: pedido.email,
        total: pedido.total,
        estado: pedido.estado,
        estado_pago: pedido.estado_pago || "pendiente",
        metodo_pago: pedido.metodo_pago || "desconocido",
        direccion: pedido.direccion,
        ciudad: pedido.ciudad,
        region: pedido.region,
        creado: pedido.created_at,
      },
      items: detalle,
    });
  } catch (err) {
    console.error("🔥 Error en /api/track_pedido:", err);
    return res.status(500).json({ error: "Error al obtener pedido" });
  }
}
