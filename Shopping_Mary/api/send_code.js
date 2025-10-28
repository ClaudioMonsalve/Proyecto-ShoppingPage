import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ success: false, error: "Email inválido" });
  }

  const code = Math.floor(100000 + Math.random() * 900000);

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

    // Guardar en Supabase
    await supabase
      .from("codigos_verificacion")
      .insert([{ email, codigo: code }]);

    console.log(`✅ Código ${code} enviado a ${email}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    return res.status(500).json({ success: false });
  }
}

