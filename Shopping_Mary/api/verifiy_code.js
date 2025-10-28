// ⚠️ Este objeto vive mientras la función serverless esté “caliente”
let codes = {};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }

  if (codes[email] && Number(code) === codes[email]) {
    delete codes[email]; // evitar reutilizar el código
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: "Código inválido" });
  }
}
