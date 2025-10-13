import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Configura MercadoPago usando variable de entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const preference = new Preference(client);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body = await json(req);
    const { items } = body;

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
    res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando la preferencia" });
  }
}
