import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Success() {
  const location = useLocation();
  const [params, setParams] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");
    const status = query.get("status");
    const preference_id = query.get("preference_id");

    // Solo guardamos si realmente hay datos
    if (payment_id && status) {
      setParams({ payment_id, status, preference_id });
    } else {
      setParams({});
    }
  }, [location.search]);

  if (!params) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Cargando información del pago...
      </p>
    );
  }

  if (!params.status) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "#d9534f" }}>
        <h1>❌ Error</h1>
        <p>No se encontró información de pago.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>
        {params.status === "approved" ? "✅ Pago exitoso" : "⚠️ Pago pendiente o rechazado"}
      </h1>
      <p>Información recibida correctamente:</p>
      <p><strong>Payment ID:</strong> {params.payment_id}</p>
      <p><strong>Preference ID:</strong> {params.preference_id}</p>
    </div>
  );
}
