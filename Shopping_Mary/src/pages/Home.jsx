import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

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

  if (loading) return <p style={{ color: "white", textAlign: "center" }}>Cargando productos...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "white", marginBottom: "30px", textAlign: "center" }}>🛍️ Productos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {productos.map((producto) => {
          const productoEnCarrito = carrito.find((p) => p.id === producto.id);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          return (
            <div key={producto.id} style={cardStyle}>
              {producto.imagen && <img src={producto.imagen} alt={producto.nombre} style={imgStyle} />}
              <h3 style={{ margin: "10px 0 5px 0" }}>{producto.nombre}</h3>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>${producto.precio.toFixed(2)}</p>
              {producto.descripcion && <p style={{ fontSize: "0.9rem", color: "#555", minHeight: "40px" }}>{producto.descripcion}</p>}
              <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>En carrito: {cantidad}</p>
              <button onClick={() => agregarAlCarrito(producto)} style={buttonStyle}>
                Agregar al carrito
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Estilos reutilizables
const cardStyle = {
  backgroundColor: "#fff",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const imgStyle = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
  borderRadius: "8px",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "10px",
  backgroundColor: "#242424",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.2s",
};

