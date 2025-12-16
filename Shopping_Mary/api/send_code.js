import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido" });
  }

  const { email } = req.body;

  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ success: false, error: "Email inválido" });
  }

  // 🔐 Código como STRING
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // ⏱️ Expira en 10 minutos
  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  ).toISOString();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    // 1️⃣ Enviar correo
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${code}`,
    });

    // 2️⃣ Guardar EXACTO en tu tabla
    const { error } = await supabase
      .from("verification_codes")
      .insert([
        {
          email: email,
          code: code,
          expires_at: expiresAt,
        },
      ]);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error general:", err);
    return res.status(500).json({
      success: false,
      error: "Error al enviar el código",
    });
  }
}
