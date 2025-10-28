// Reutiliza la misma memoria global
global.codes = global.codes || {};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const storedCode = global.codes[email];

  if (!storedCode) {
    return res.status(400).json({ success: false, error: "Código no encontrado (expirado o no enviado)" });
  }

  if (parseInt(code) !== storedCode) {
    return res.status(400).json({ success: false, error: "Código inválido" });
  }

  // ✅ Código correcto → eliminarlo para que no se reutilice
  delete global.codes[email];

  console.log(`✅ Código correcto para ${email}`);
  return res.status(200).json({ success: true });
}
