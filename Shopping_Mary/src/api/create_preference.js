import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configura MercadoPago usando variable de entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const preference = new Preference(client);

export default async function handler(req, res) {
  console.log("✅ Endpoint /api/create_preference llamado");

  if (req.method !== "POST") {
    console.log("❌ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body = await json(req);
    const { items } = body;

    console.log("Items recibidos:", items);
    console.log(
      "Token disponible:",
      process.env.MERCADOPAGO_ACCESS_TOKEN ? "Sí" : "No"
    );

    const preferenceData = {
      items: items.map((item) => ({
        title: item.nombre,
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
      })),
      back_urls: {
        success: "https://proyecto-shopping-page.vercel.app/",
        failure: "https://proyecto-shopping-page.vercel.app/",
        pending: "https://proyecto-shopping-page.vercel.app/",
      },
    };

    const response = await preference.create({ body: preferenceData });
    console.log("✅ Preferencia creada:", response);

    res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({ error: "Error creando la preferencia" });
  }
}
