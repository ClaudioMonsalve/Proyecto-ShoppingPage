import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, pedido_id, total, direccion, ciudad, region, tracking_token } = req.body;

    // buscar el token del pedido
    const { data: pedido, error } = await supabase
      .from("pedidos")
      .select("tracking_token")
      .eq("id", pedido_id)
      .single();

    if (error || !pedido) {
      console.error("❌ Error buscando pedido:", error);
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const trackUrl = `https://proyecto-shopping-page.vercel.app/track?token=${tracking_token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "📦 Confirmación de tu pedido",
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido ha sido procesado exitosamente.</p>
        <p><strong>Total:</strong> $${total}</p>
        <p><strong>Dirección:</strong> ${direccion}, ${ciudad}, ${region}</p>
        <p>Puedes revisar el estado de tu pedido aquí:</p>
        <a href="${trackUrl}" target="_blank">${trackUrl}</a>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error en send_confirmacion:", err);
    return res.status(500).json({ error: "Error enviando correo" });
  }
}
