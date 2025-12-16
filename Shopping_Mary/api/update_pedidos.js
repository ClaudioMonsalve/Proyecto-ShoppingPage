import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  console.log("🟢 update_pedido HIT", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  return res.status(200).json({ success: true });
}
