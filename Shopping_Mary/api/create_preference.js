import { json } from "micro";
import { MercadoPagoConfig, Preference } from "mercadopago";

// 🧩 Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN, // ⚠️ debe estar definida en Vercel
});
const preference = new Preference(client);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido (usa POST)" });
  }

  try {
    // 📦 Leer datos del body
    const body = await json(req);
    const { email, telefono, direccion, ciudad, region, items } = body;

    if (!email || !items?.length) {
      return res.status(400).json({ error: "Faltan datos para crear la preferencia" });
    }

    // 🌐 Tu dominio base directamente
    const baseUrl = "https://proyecto-shopping-page.vercel.app";

    // 💡 URLs seguras (sin caracteres especiales ni parámetros dinámicos)
    const backUrls = {
      success: `${baseUrl}/success?status=approved`,
      failure: `${baseUrl}/success?status=failed`,
      pending: `${baseUrl}/success?status=pending`,
    };

    // 🧾 Crear la preferencia
    const preferenceData = {
      items: items.map((item) => ({
        title: item.nombre || "Producto sin nombre",
        unit_price: Number(item.precio) || 0,
        quantity: Number(item.cantidad) || 1,
        currency_id: "CLP",
      })),
      back_urls: backUrls,
      auto_return: "approved",

      // 🧠 Guardar info del cliente
      metadata: {
        email,
        telefono,
        direccion,
        ciudad,
        region,
      },
    };

    // 💳 Crear la preferencia en MercadoPago
    const response = await preference.create({ body: preferenceData });

    console.log("✅ Preferencia creada correctamente");
    console.log("🆔 ID:", response.id);
    console.log("🌐 URL:", response.init_point || response.sandbox_init_point);

    // 🔙 Responder con el link de pago
    return res.status(200).json({
      init_point:
        response.sandbox_init_point || response.init_point || null,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return res
      .status(500)
      .json({ error: error.message || "Error creando la preferencia" });
  }
}
