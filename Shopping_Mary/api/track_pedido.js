// /api/track_pedido.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // ⚠️ service key
);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Falta token" });

    // pedido por token
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select("id, email, total, estado, created_at")
      .eq("tracking_token", token)
      .single();

    if (pedidoError || !pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // items
    const { data: items, error: itemsError } = await supabase
      .from("detalle_pedidos")
      .select(`
        id,
        cantidad,
        subtotal,
        producto:productos(nombre, precio)
      `)
      .eq("pedido_id", pedido.id);

    if (itemsError) throw itemsError;

    const detalle = (items || []).map((i) => ({
      id: i.id,
      nombre: i.producto?.nombre,
      cantidad: i.cantidad,
      precio: i.producto?.precio,
      subtotal: i.subtotal,
    }));

    return res.status(200).json({ pedido, items: detalle });
  } catch (err) {
    console.error("❌ track_pedido error:", err);
    return res.status(500).json({ error: "Error al obtener pedido" });
  }
}
