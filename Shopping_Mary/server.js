import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference } from "mercadopago";

const app = express();
app.use(cors());
app.use(express.json());

// Configura MercadoPago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-665879217034266-101222-a00dcae55c33838233ae933e54231c4f-291368995"
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
        success: "http://localhost:5173/",
        failure: "http://localhost:5173/",
        pending: "http://localhost:5173/",
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