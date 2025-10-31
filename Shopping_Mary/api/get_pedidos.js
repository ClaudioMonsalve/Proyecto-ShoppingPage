// /api/get_pedidos.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 👇 ESTA LÍNEA ES CRUCIAL
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido (usa GET)" });
  }

  try {
    console.log("🟢 Iniciando función get_pedidos");

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Pedidos obtenidos:", data?.length || 0);
    return res.status(200).json({ success: true, pedidos: data });
  } catch (err) {
    console.error("🔥 Error en get_pedidos:", err);
    return res.status(500).json({ error: err.message });
  }
}
