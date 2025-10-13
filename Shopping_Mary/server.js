import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();

// 🔒 Configura CORS solo para tu dominio de producción
const allowedOrigins = [
  process.env.FRONTEND_URL_PROD, // Ej: https://proyecto-shopping-page.vercel.app
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  }
}));

app.use(express.json());

// ⚡ Token de producción o sandbox según variable de entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

// Endpoint para crear la preferencia
app.post("/create_preference", async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No hay items en el carrito" });
  }

  try {
    const preferenceData = {
      items: items.map(item => ({
        title: item.nombre,
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
      })),
      back_urls: {
        success: process.env.BACK_URL_SUCCESS,
        failure: process.env.BACK_URL_FAILURE,
        pending: process.env.BACK_URL_PENDING,
      },
      auto_return: "approved"
    };

    const response = await preference.create({ body: preferenceData });
    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error("Error creando preferencia:", error.response?.data || error.message || error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
