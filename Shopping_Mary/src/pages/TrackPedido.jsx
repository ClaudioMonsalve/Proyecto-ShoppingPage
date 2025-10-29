// src/pages/TrackPedido.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function TrackPedido() {
  const [searchParams] = useSearchParams();
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token no encontrado.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/track_pedido?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPedido(data.pedido);
        setItems(data.items || []);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar la información del pedido.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando pedido...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>📦 Estado del Pedido</h1>
      <h2>Pedido #{pedido.id}</h2>
      <p><b>Estado:</b> {pedido.estado}</p>
      <p><b>Email:</b> {pedido.email}</p>
      <p><b>Total:</b> ${pedido.total}</p>
      <p><b>Fecha:</b> {new Date(pedido.created_at).toLocaleString()}</p>

      <h3>Detalle</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ marginBottom: 8 }}>
            {it.nombre} — {it.cantidad} x ${it.precio} = ${it.subtotal}
          </li>
        ))}
      </ul>
    </div>
  );
}
