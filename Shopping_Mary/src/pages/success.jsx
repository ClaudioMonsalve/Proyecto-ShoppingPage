// src/pages/Success.jsx
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

    if (!payment_id || status !== "approved") {
      setError("Pago no aprobado o faltan datos");
      setLoading(false);
      return;
    }

    async function fetchPedido() {
      try {
        // Traer info del pedido
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("pedidos")
          .select("id, email, total, estado, created_at")
          .eq("id", payment_id) // reemplaza si usas otro campo
          .single();

        if (pedidoError) throw pedidoError;

        setPedido(pedidoData);

        // Traer detalle y productos
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
        console.error(err);
        setError("Error al cargar la información del pedido");
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
      <h1>Pago aprobado ✅</h1>
      <h2>Pedido ID: {pedido.id}</h2>
      <p>Email: {pedido.email}</p>
      <p>Total: ${pedido.total}</p>
      <p>Estado: {pedido.estado}</p>

      <h3>Detalle:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: "10px" }}>
            {item.nombre} - {item.cantidad} x ${item.precio} = ${item.subtotal}
          </li>
        ))}
      </ul>
    </div>
  );
}
