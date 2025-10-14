import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de tener este archivo

export default function Home({ carrito, setCarrito }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer productos de Supabase al cargar la página
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Error al traer productos:", error);
      } else {
        setProductos(data);
      }
      setLoading(false);
    };

    fetchProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((p) => p.id === producto.id);
    if (productoExistente) {
      setCarrito(
        carrito.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  if (loading) return <p style={{ color: "white" }}>Cargando productos...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "white", marginBottom: "20px" }}>Productos</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {productos.map((producto) => {
          const productoEnCarrito = carrito.find((p) => p.id === producto.id);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          return (
            <div
              key={producto.id}
              style={{
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "8px",
                width: "200px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ width: "100%", borderRadius: "6px" }}
              />
              <h3>{producto.nombre}</h3>
              <p>${producto.precio}</p>
              <p>Cantidad en carrito: {cantidad}</p>
              <button onClick={() => agregarAlCarrito(producto)}>
                Agregar al carrito
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
