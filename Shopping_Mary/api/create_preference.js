// /api/create_preference.js
import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN, // TEST Access Token
});
const preference = new Preference(client);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = await json(req);
    const { items } = body;

    if (!items || items.length === 0) return res.status(400).json({ error: "No se recibieron items" });

    const preferenceData = {
      items: items.map(item => ({
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

    // 🔹 Sandbox para pruebas
    return res.status(200).json({ init_point: response.sandbox_init_point });

  } catch (error) {
    console.error("Error creando preferencia:", error);
    return res.status(500).json({ error: "Error creando la preferencia" });
  }
}
