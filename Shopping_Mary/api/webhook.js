// /api/webhook.js
import { json } from "micro";
import mercadopago from "mercadopago";
import { supabase } from "../../src/supabaseClient";

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN, // TEST
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const body = await json(req);
  const paymentId = body.id; // o body.data.id según el webhook

  try {
    const payment = await mercadopago.payment.findById(paymentId);

    if (payment.status === "approved") {
      await supabase.from("pedidos").insert([
        {
          user_id: payment.payer.id,
          items: JSON.stringify(payment.additional_info.items),
          total: payment.transaction_amount,
          status: payment.status,
        },
      ]);
      console.log("✅ Pedido guardado en Supabase");
    }

    return res.status(200).send("ok");

  } catch (err) {
    console.error("❌ Error procesando webhook:", err);
    return res.status(500).send("error");
  }
}
