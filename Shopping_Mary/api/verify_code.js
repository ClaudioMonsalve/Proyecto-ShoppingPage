import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }

  const { data, error } = await supabase
    .from("codigos_verificacion")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return res.status(400).json({ success: false, error: "Código no encontrado" });
  }

  if (parseInt(code) !== data.codigo) {
    return res.status(400).json({ success: false, error: "Código inválido" });
  }

  // ✅ borrar código para que no se reutilice
  await supabase.from("codigos_verificacion").delete().eq("id", data.id);

  console.log(`✅ Código correcto para ${email}`);
  return res.status(200).json({ success: true });
}


