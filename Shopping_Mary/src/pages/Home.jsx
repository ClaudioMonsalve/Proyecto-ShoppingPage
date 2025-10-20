import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ carrito, setCarrito }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Convierte bytea (hex con \x) a Base64
  const byteaToBase64 = (bytea) => {
    if (!bytea) return null;
    const hex = bytea.startsWith("\\x") ? bytea.slice(2) : bytea;
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return btoa(str);
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
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Cargando productos...
      </p>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2
        style={{
          color: "white",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
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

          const imagenBase64 = byteaToBase64(producto.imagen);

          return (
            <div key={producto.id} style={cardStyle}>
              {imagenBase64 ? (
                <img
                  src={`data:image/png;base64,${imagenBase64}`}
                  alt={producto.nombre}
                  style={imgStyle}
                />
              ) : (
                <div style={imgPlaceholderStyle}>Sin imagen</div>
              )}

              <h3 style={titleStyle}>{producto.nombre}</h3>

              <p style={priceStyle}>${producto.precio.toFixed(2)}</p>

              {producto.descripcion && (
                <p style={descStyle}>{producto.descripcion}</p>
              )}

              <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                En carrito: {cantidad}
              </p>

              <button
                onClick={() => agregarAlCarrito(producto)}
                style={buttonStyle}
              >
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
  backgroundColor: "#1f1f1f",
  color: "#fff",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const imgStyle = {
  width: "100%",
  height: "150px",
  objectFit: "contain",
  borderRadius: 8,
  backgroundColor: "#111",
};

const imgPlaceholderStyle = {
  width: "100%",
  height: "150px",
  borderRadius: 8,
  backgroundColor: "#333",
  color: "#aaa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.9rem",
};

const titleStyle = { margin: "10px 0 5px 0", color: "#fff" };
const priceStyle = { margin: "5px 0", fontWeight: "bold", color: "#ff8c00" };
const descStyle = { fontSize: "0.9rem", color: "#ccc", minHeight: "40px" };

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
