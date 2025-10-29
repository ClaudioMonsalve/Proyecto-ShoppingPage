import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Success() {
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const pedido_id = localStorage.getItem("pedido_id");

    // ⚡ Si no hay pedido guardado → redirige al Home de inmediato
    if (!pedido_id) {
      setError("No se encontró un pedido reciente.");
      navigate("/");
      return;
    }

    async function fetchPedido() {
      try {
        // 📦 Obtener datos del pedido
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("pedidos")
          .select("id, email, total, estado, created_at")
          .eq("id", Number(pedido_id))
          .single();

        if (pedidoError) throw pedidoError;
        setPedido(pedidoData);

        // 🧾 Obtener los ítems relacionados con el pedido
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

        // 🏠 Redirige inmediatamente al Home cuando todo carga bien
        navigate("/");
      } catch (err) {
        console.error("❌ Error cargando pedido:", err);
        setError("No se pudo cargar el pedido.");
        // ⚡ Redirige aunque haya error
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [navigate]);

  // 🕒 Como redirige al instante, no mostramos nada visualmente
  return null;
}
