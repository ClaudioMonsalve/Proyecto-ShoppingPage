// /api/update_pedido.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "PUT")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const { id, estado } = req.body;
    if (!id || !estado)
      return res.status(400).json({ error: "Faltan datos para actualizar" });

    const { error } = await supabase
      .from("pedidos")
      .update({ estado })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error al actualizar pedido:", err);
    return res.status(500).json({ error: "Error al actualizar pedido" });
  }
}
