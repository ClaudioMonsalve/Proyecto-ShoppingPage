import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id, estado, estado_pago } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Falta id" });
    }

    const updateData = {};
    if (estado) updateData.estado = estado;
    if (estado_pago) updateData.estado_pago = estado_pago;

    const { error } = await supabase
      .from("pedidos")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 update_pedido error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
