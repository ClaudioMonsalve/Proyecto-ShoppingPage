import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: "Faltan datos",
    });
  }

  try {
    // 🔍 Buscar el último código enviado a ese email
    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        error: "Código no encontrado",
      });
    }

    // ⏱️ Verificar expiración
    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "El código expiró",
      });
    }

    // 🔐 Verificar código (text vs text)
    if (code !== data.code) {
      return res.status(400).json({
        success: false,
        error: "Código inválido",
      });
    }

    // 🧹 Eliminar código para que no se reutilice
    await supabase
      .from("verification_codes")
      .delete()
      .eq("id", data.id);

    console.log(`✅ Código correcto para ${email}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error verificando código:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno al verificar el código",
    });
  }
}
