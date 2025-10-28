import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Success() {
  const location = useLocation();
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const payment_id = query.get("payment_id");
    const status = query.get("status");

    // ⚠️ Validación de parámetros
    if (!payment_id || status !== "approved") {
      console.warn("Parámetros inválidos:", { payment_id, status });
      setError("Pago no aprobado o faltan datos válidos");
      setLoading(false);
      return;
    }

    async function fetchPedido() {
      try {
        console.log("🔎 Buscando pedido con payment_id:", payment_id);

        // 🧾 Buscar pedido por payment_id
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("pedidos")
          .select("id, email, total, estado, created_at, payment_id")
          .eq("payment_id", payment_id)
          .single();

        if (pedidoError) throw pedidoError;
        if (!pedidoData) throw new Error("Pedido no encontrado");

        setPedido(pedidoData);

        // 🧺 Traer detalle del pedido + producto relacionado
        const { data: itemsData, error: itemsError } = await supabase
          .from("detalle_pedidos")
          .select(`
            id,
            cantidad,
            subtotal,
            producto:productos(nombre, precio)
          `)
          .eq("pedido_id", pedidoData.id);

        if (itemsError) throw itemsError;

        setItems(
          itemsData.map((i) => ({
            id: i.id,
            nombre: i.producto.nombre,
            cantidad: i.cantidad,
            precio: i.producto.precio,
            subtotal: i.subtotal,
          }))
        );
      } catch (err) {
        console.error("❌ Error cargando pedido:", err);
        setError("Error al cargar la información del pedido.");
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [location.search]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando pedido...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>✅ Pago aprobado</h1>
      <h2>Pedido ID interno: {pedido.id}</h2>
      <p><strong>Payment ID (MercadoPago):</strong> {pedido.payment_id}</p>
      <p><strong>Email:</strong> {pedido.email}</p>
      <p><strong>Total:</strong> ${pedido.total}</p>
      <p><strong>Estado:</strong> {pedido.estado}</p>

      <h3>🧺 Detalle del pedido</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: "10px" }}>
            {item.nombre} — {item.cantidad} × ${item.precio} = ${item.subtotal}
          </li>
        ))}
      </ul>
    </div>
  );
}
