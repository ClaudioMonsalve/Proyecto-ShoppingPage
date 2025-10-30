// /api/save_pedido.js
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// ✅ Usa tus variables de entorno (con tus mismos nombres)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY // ← debe ser la service_role key
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { email, telefono, direccion, ciudad, region, total, carrito } = req.body;

    if (!email || !carrito?.length) {
      return res.status(400).json({ error: "Faltan datos para guardar el pedido" });
    }

    // 🧾 Crear token de tracking
    const tracking_token = crypto.randomBytes(32).toString("hex");

    // 🛒 Guardar pedido principal
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([
        {
          email,
          telefono,
          direccion,
          ciudad,
          region,
          total,
          estado: "pagado",
          tracking_token,
        },
      ])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 🧺 Guardar detalle
    const detalle = carrito.map((p) => ({
      pedido_id: pedido.id,
      producto_id: p.id,
      cantidad: p.cantidad,
      subtotal: p.precio * p.cantidad,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedidos")
      .insert(detalle);

    if (detalleError) throw detalleError;

    // ✉️ Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const trackUrl = `https://proyecto-shopping-page.vercel.app/track?token=${tracking_token}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "📦 Confirmación de tu pedido",
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido se ha confirmado correctamente.</p>
        <p><strong>Total:</strong> $${total}</p>
        <p><strong>Dirección:</strong> ${direccion}, ${ciudad}, ${region}</p>
        <p>Puedes revisar el estado de tu pedido aquí:</p>
        <a href="${trackUrl}">${trackUrl}</a>
      `,
    });

    console.log("✅ Pedido guardado correctamente:", pedido.id);
    return res.status(200).json({ success: true, pedido });
  } catch (err) {
    console.error("❌ Error en save_pedido:", err);
    return res.status(500).json({ error: err.message });
  }
}
