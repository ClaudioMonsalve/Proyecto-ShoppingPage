import nodemailer from "nodemailer";

// 👇 Usamos la misma referencia global en ambos archivos
global.codes = global.codes || {};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ success: false });
  }

  const code = Math.floor(100000 + Math.random() * 900000);
  global.codes[email] = code; // 👈 importante

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${code}`,
    });
    console.log(`✅ Código ${code} enviado a ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    res.status(500).json({ success: false });
  }
}

