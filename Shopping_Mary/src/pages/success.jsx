import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Success({ setCarrito }) {
  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const pedido_id = localStorage.getItem("pedido_id");

    if (!pedido_id) {
      setError("No se encontró un pedido reciente.");
      navigate("/");
      return;
    }

    async function fetchPedido() {
      try {
        const { data: pedidoData, error: pedidoError } = await supabase
          .from("pedidos")
          .select("id, email, total, estado, created_at")
          .eq("id", Number(pedido_id))
          .single();

        if (pedidoError) throw pedidoError;
        setPedido(pedidoData);

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

        // 🧹 Vaciar carrito global + localStorage
        setCarrito([]);
        localStorage.removeItem("carrito");

        // 🏠 Redirigir
        navigate("/");
      } catch (err) {
        console.error("❌ Error cargando pedido:", err);
        setError("No se pudo cargar el pedido.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [navigate, setCarrito]);

  return null;
}

