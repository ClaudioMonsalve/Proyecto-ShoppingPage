global.codes = global.codes || {};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }

  const storedCode = global.codes[email];

  if (!storedCode) {
    console.log("⚠️ No se encontró código para", email);
    return res.status(400).json({
      success: false,
      error: "Código no encontrado (expirado o no enviado)",
    });
  }

  if (parseInt(code) !== storedCode) {
    console.log("⚠️ Código incorrecto:", code, "vs", storedCode);
    return res.status(400).json({ success: false, error: "Código inválido" });
  }

  delete global.codes[email];
  console.log(`✅ Código verificado correctamente para ${email}`);
  return res.status(200).json({ success: true });
}

