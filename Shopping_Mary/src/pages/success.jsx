// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const [params, setParams] = useState({});

  useEffect(() => {
    // Extraer parámetros de la URL
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");
    const status = query.get("status");
    const preference_id = query.get("preference_id");

    if (payment_id && status) {
      setParams({ payment_id, status, preference_id });
    }
  }, [location.search]);

  if (!params.status) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando información del pago...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Pago {params.status}</h1>
      <p>✅ Información recibida correctamente</p>
      <p>Payment ID: {params.payment_id}</p>
      <p>Preference ID: {params.preference_id}</p>
    </div>
  );
}

