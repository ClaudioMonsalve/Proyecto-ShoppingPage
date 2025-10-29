import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 IMPORTANTE
import { supabase } from "../supabaseClient";

export default function Success() {
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // 👈 para redirigir

  useEffect(() => {
    const pedido_id = localStorage.getItem("pedido_id");

    if (!pedido_id) {
      setError("No se encontró un pedido reciente.");
      setLoading(false);
      // ⏳ Redirige después de 2 segundos aunque no haya pedido
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    async function fetchPedido() {
      try {
        // Obtener pedido
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("pedidos")
          .select("id, email, total, estado, created_at")
          .eq("id", Number(pedido_id))
          .single();

        if (pedidoError) throw pedidoError;
        setPedido(pedidoData);

        // Obtener detalle
        const { data: itemsData, error: itemsError } = await supabase
          .from("detalle_pedidos")
          .select(`
            id,
            cantidad,
            subtotal,
            producto:productos(nombre, precio)
          `)
          .eq("pedido_id", Number(pedido_id));

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

        // 🕒 Redirige automáticamente al home después de 4 segundos
        setTimeout(() => navigate("/"), 4000);
      } catch (err) {
        console.error("❌ Error cargando pedido:", err);
        setError("No se pudo cargar el pedido.");
        // ⏳ Redirige aunque haya error
        setTimeout(() => navigate("/"), 4000);
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [navigate]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando pedido...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>✅ Pedido realizado</h1>
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

      <p style={{ color: "#888", marginTop: "15px" }}>
        Serás redirigido automáticamente al inicio 🏠...
      </p>
    </div>
  );
}
