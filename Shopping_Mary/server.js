// server.js
import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

mercadopago.configurations.setAccessToken("TEST-3678382236791652-100810-93ef24b12ebbbd5136f2921e0a83e889-291368995");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create_preference", async (req, res) => {
  try {
    const { carrito } = req.body;

    if (!carrito || !carrito.length) {
      return res.status(400).json({ error: "Carrito vacío o inválido" });
    }

    const items = carrito.map(prod => ({
      title: prod.nombre,
      unit_price: Number(prod.precio),
      quantity: Number(prod.cantidad),
    }));

    const preference = {
      items,
      back_urls: {
        success: "http://localhost:5173/",
        failure: "http://localhost:5173/",
        pending: "http://localhost:5173/"
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ init_point: response.body.init_point });
  } catch (err) {
    console.error("Error al crear sesión:", err);
    res.status(500).json({ error: "Error al crear preferencia" });
  }
});

app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));
