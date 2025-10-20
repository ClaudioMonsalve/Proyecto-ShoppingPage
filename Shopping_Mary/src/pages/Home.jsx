import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ carrito, setCarrito }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Convierte hex a Base64
  const hexToBase64 = (hexString) => {
    return btoa(
      hexString.match(/\w{2}/g).map((a) => String.fromCharCode(parseInt(a, 16))).join("")
    );
  };

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("❌ Error al traer productos:", error);
        setLoading(false);
        return;
      }

      setProductos(data);
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

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading)
    return <p style={{ color: "white", textAlign: "center" }}>Cargando productos...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>
        🛍️ Productos
      </h2>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "1rem",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {productosFiltrados.map((producto) => {
          const productoEnCarrito = carrito.find((p) => p.id === producto.id);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          return (
            <div key={producto.id} style={cardStyle}>
              {producto.imagen && (
                <img
                  src={`data:image/png;base64,${hexToBase64(producto.imagen)}`}
                  alt={producto.nombre}
                  style={imgStyle}
                />
              )}
              <h3 style={{ margin: "10px 0 5px 0" }}>{producto.nombre}</h3>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                ${producto.precio.toFixed(2)}
              </p>
              {producto.descripcion && (
                <p style={{ fontSize: "0.9rem", color: "#555", minHeight: "40px" }}>
                  {producto.descripcion}
                </p>
              )}
              <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                En carrito: {cantidad}
              </p>
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

// Estilos
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
  objectFit: "contain", // <-- imagen completa sin recorte
  borderRadius: 8,
  backgroundColor: "#111", // opcional, para ver fondo si la imagen no llena todo
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
