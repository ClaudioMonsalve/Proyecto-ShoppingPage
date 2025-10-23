// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [params, setParams] = useState({});

  useEffect(() => {
    // Extraer parámetros desde la URL
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");
    const status = query.get("status");
    const preference_id = query.get("preference_id");

    if (payment_id && status) {
      setParams({ payment_id, status, preference_id });

      // Guardar en tu base de datos (Supabase)
      fetch("/api/save_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id, status, preference_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Pedido guardado:", data);
          setSaved(true);
        })
        .catch((err) => console.error("Error:", err));
    }
  }, [location.search]);

  if (!params.status) {
    return <p>Cargando información del pago...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Pago {params.status}</h1>
      {saved ? (
        <p>✅ Pedido guardado correctamente</p>
      ) : (
        <p>Guardando pedido...</p>
      )}
      <p>Payment ID: {params.payment_id}</p>
      <p>Preference ID: {params.preference_id}</p>
    </div>
  );
}
