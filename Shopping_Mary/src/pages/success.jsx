// /pages/success.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { payment_id, status, preference_id } = router.query;

  useEffect(() => {
    if (!payment_id) return;

    fetch('/api/save_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id, status, preference_id }),
    })
    .then(res => res.json())
    .then(data => console.log('Pedido guardado:', data))
    .catch(err => console.error('Error:', err));
  }, [payment_id, status, preference_id]);

  return <h1>Pago {status}</h1>;
}
