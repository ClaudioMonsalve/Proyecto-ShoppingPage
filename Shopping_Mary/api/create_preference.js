import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const preference = new Preference(client);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = await json(req);
    const { email, telefono, direccion, ciudad, region, items } = body;

    if (!email || !items?.length) {
      return res
        .status(400)
        .json({ error: "Faltan datos para crear la preferencia" });
    }

    // ✅ URL dinámica con todos los datos
    const successUrl = new URL("https://proyecto-shopping-page.vercel.app/success");
    successUrl.searchParams.append("status", "approved");
    successUrl.searchParams.append("email", email);
    successUrl.searchParams.append("telefono", telefono);
    successUrl.searchParams.append("direccion", direccion);
    successUrl.searchParams.append("ciudad", ciudad);
    successUrl.searchParams.append("region", region);

    // 🧾 Estructura de preferencia de pago
    const preferenceData = {
      items: items.map((item) => ({
        title: item.nombre || "Producto",
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
      })),
      back_urls: {
        success: successUrl.toString(), // 👈 ahora sí usamos la URL completa
        failure: "https://proyecto-shopping-page.vercel.app/",
        pending: "https://proyecto-shopping-page.vercel.app/",
      },
      auto_return: "approved",
    };

    // 💳 Crear preferencia
    const response = await preference.create({ body: preferenceData });

    // 🔙 Devolver link del checkout sandbox
    return res.status(200).json({ init_point: response.sandbox_init_point });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return res.status(500).json({ error: "Error creando la preferencia" });
  }
}
