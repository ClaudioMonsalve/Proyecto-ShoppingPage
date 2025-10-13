import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();
app.use(cors());
app.use(express.json());

// Configura MercadoPago
const client = new MercadoPagoConfig({
  accessToken: "TEST-3082403962218338-101222-e9fe5842d14600316ae5e5dafb29cc9e-291368995"
});
const preference = new Preference(client);

// Endpoint para crear la preferencia
app.post("/create_preference", async (req, res) => {
  try {
    const { items } = req.body;

    const preferenceData = {
      items: items.map(item => ({
        title: item.nombre,
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
      })),
      back_urls: {
        success: "http://localhost:5173/success",
        failure: "http://localhost:5173/failure",
        pending: "http://localhost:5173/pending",
      },
    };

    const response = await preference.create({ body: preferenceData });

    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando la preferencia" });
  }
});

app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});