// /api/create_preference.js
import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// ✅ Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const preference = new Preference(client);

// ✅ Supabase (solo backend)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = await json(req);
    const { items, datosCliente } = body;

    if (!datosCliente || !datosCliente.email || !items || items.length === 0) {
      return res.status(400).json({ error: "Faltan datos del cliente o items" });
    }

    const { email, telefono, region, ciudad, direccion } = datosCliente;

    // 🧮 Calcular total
    const total = items.reduce(
      (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
      0
    );

    // 🪙 Token de seguimiento único
    const tracking_token = crypto.randomBytes(32).toString("hex");

    // 📝 Guardar pedido completo en Supabase
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([
        {
          email,
          telefono,
          region,
          ciudad,
          direccion,
          total,
          estado: "Pendiente",
          tracking_token,
        },
      ])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 🛍 Guardar detalle de productos
    const detalle = items.map((p) => ({
      pedido_id: pedido.id,
      producto_id: p.id,
      cantidad: p.cantidad,
      subtotal: p.precio * p.cantidad,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedidos")
      .insert(detalle);

    if (detalleError) throw detalleError;

    // 💳 Crear preferencia en Mercado Pago
    const preferenceData = {
      items: items.map((item) => ({
        title: item.nombre || "Producto",
        unit_price: Number(item.precio) > 0 ? Number(item.precio) : 1,
        quantity: Number(item.cantidad) >= 1 ? Number(item.cantidad) : 1,
      })),
      back_urls: {
        success: "https://proyecto-shopping-page.vercel.app/success",
        failure: "https://proyecto-shopping-page.vercel.app/",
        pending: "https://proyecto-shopping-page.vercel.app/",
      },
      auto_return: "approved",
    };

    const response = await preference.create({ body: preferenceData });

    // ✉️ Enviar correo con link de seguimiento
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
      subject: "📦 Seguimiento de tu pedido",
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Ya registramos tu pedido. Puedes revisar el estado en cualquier momento aquí:</p>
        <a href="${trackUrl}">${trackUrl}</a>
        <hr>
        <p><strong>Resumen de envío:</strong></p>
        <ul>
          <li><b>Dirección:</b> ${direccion}</li>
          <li><b>Ciudad:</b> ${ciudad}</li>
          <li><b>Región:</b> ${region}</li>
          <li><b>Teléfono:</b> ${telefono}</li>
        </ul>
      `,
    });

    // ✅ Devolver link de pago + id del pedido
    return res.status(200).json({
      init_point: response.sandbox_init_point,
      pedido_id: pedido.id,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return res.status(500).json({ error: "Error creando la preferencia" });
  }
}
