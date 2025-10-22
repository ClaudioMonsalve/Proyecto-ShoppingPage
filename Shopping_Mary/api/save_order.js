// /pages/api/save_order.js
import { supabase } from '../../supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { payment_id, status, preference_id } = req.body;

  if (status !== 'approved') return res.status(400).send('Pago no aprobado');

  const { data, error } = await supabase
    .from('orders')
    .insert([{ payment_id, status, preference_id }]);

  if (error) return res.status(500).json({ error });

  res.status(200).json({ message: 'Pedido guardado', data });
}
