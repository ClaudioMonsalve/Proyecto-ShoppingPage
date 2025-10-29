import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const { email, pedido_id, total, direccion, ciudad, region } = req.body;

    if (!email || !pedido_id)
      return res.status(400).json({ error: "Faltan datos para enviar el correo" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const html = `
      <h2>✅ ¡Gracias por tu compra!</h2>
      <p>Tu pedido <strong>#${pedido_id}</strong> fue confirmado exitosamente.</p>
      <p><strong>Total:</strong> $${total}</p>
      <p><strong>Dirección:</strong> ${direccion}, ${ciudad}, ${region}</p>
      <p>Puedes hacer seguimiento desde tu correo o directamente en nuestra web.</p>
      <hr>
      <p style="font-size:12px;color:gray;">Este es un mensaje automático, por favor no respondas.</p>
    `;

    await transporter.sendMail({
      from: `"Tienda Online" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "📦 Confirmación de tu pedido",
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error enviando correo de confirmación:", err);
    return res.status(500).json({ error: "No se pudo enviar el correo" });
  }
}
