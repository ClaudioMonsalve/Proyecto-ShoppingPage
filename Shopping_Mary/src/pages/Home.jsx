import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ carrito, setCarrito }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

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
    return <p style={styles.loading}>Cargando productos...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>✨ Catálogo de Productos ✨</h2>

      <input
        type="text"
        placeholder="🔍 Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={styles.inputBusqueda}
      />

      <div style={styles.grid}>
        {productosFiltrados.map((producto) => {
          const productoEnCarrito = carrito.find((p) => p.id === producto.id);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          const imagenBase64 = byteaToBase64(producto.imagen);

          return (
            <div
              key={producto.id}
              style={styles.card}
              onMouseEnter={(e) =>
                e.currentTarget.querySelector("img")?.classList.add("hoverImg")
              }
              onMouseLeave={(e) =>
                e.currentTarget.querySelector("img")?.classList.remove("hoverImg")
              }
            >
              {imagenBase64 ? (
                <img
                  src={`data:image/png;base64,${imagenBase64}`}
                  alt={producto.nombre}
                  style={styles.imagen}
                  className="productImage"
                />
              ) : (
                <div style={styles.imgPlaceholder}>Sin imagen</div>
              )}

              <h3 style={styles.nombre}>{producto.nombre}</h3>
              <p style={styles.precio}>${producto.precio.toFixed(2)}</p>
              {producto.descripcion && (
                <p style={styles.descripcion}>{producto.descripcion}</p>
              )}
              <p style={styles.cantidad}>🛒 En carrito: {cantidad}</p>
              <button
                onClick={() => agregarAlCarrito(producto)}
                style={styles.boton}
                onMouseEnter={(e) =>
                  e.currentTarget.classList.add("hoverBtn")
                }
                onMouseLeave={(e) =>
                  e.currentTarget.classList.remove("hoverBtn")
                }
              >
                ➕ Agregar al carrito
              </button>
            </div>
          );
        })}
      </div>

      {/* CSS para animaciones */}
      <style>
        {`
          .hoverImg {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(255,92,141,0.5);
            transition: all 0.4s ease;
          }
          .hoverBtn {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(255,92,141,0.5);
            transition: all 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}

// === ESTILOS ===
const styles = {
  container: {
    padding: "20px 10px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Poppins', sans-serif",
    background: "linear-gradient(180deg, #121212 0%, #1a1a1a 100%)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  titulo: {
    color: "#ff5c8d",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "2rem",
    letterSpacing: "1px",
    textShadow: "0 2px 10px rgba(255,92,141,0.5)",
  },
  inputBusqueda: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    marginBottom: "20px",
    fontSize: "1rem",
    backgroundColor: "rgba(30,30,30,0.6)",
    color: "white",
    outline: "none",
    transition: "0.3s",
    boxSizing: "border-box",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // flexible para móviles
    gap: "15px",
    width: "100%",
    boxSizing: "border-box",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.4)",
    textAlign: "center",
    color: "white",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    maxWidth: "100%", // evita desbordes
    boxSizing: "border-box",
  },
  imagen: {
    width: "100%",
    height: "auto",
    maxHeight: "200px",
    objectFit: "contain",
    borderRadius: "12px",
    marginBottom: "10px",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  imgPlaceholder: {
    width: "100%",
    minHeight: "150px",
    borderRadius: "12px",
    backgroundColor: "#1c1c1c",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: { fontSize: "1.1rem", fontWeight: "700", color: "#ffb347", marginBottom: "5px" },
  precio: { fontSize: "1rem", fontWeight: "bold", color: "#ff5c8d", marginBottom: "5px" },
  descripcion: { fontSize: "0.85rem", color: "#ccc", minHeight: "30px", marginBottom: "8px" },
  cantidad: { fontSize: "0.8rem", marginBottom: "8px", color: "#aaa" },
  boton: {
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#ff5c8d,#ffb347)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  loading: { textAlign: "center", marginTop: "80px", color: "#ff5c8d", fontSize: "1.3rem", fontWeight: "bold" },
};

// MEDIA QUERY INLINE para mobile (opcional si quieres aún más control)
const mobileStyles = `
@media (max-width: 500px) {
  .productImage { max-height: 150px; }
  .card { padding: 10px; border-radius: 12px; }
  input { font-size: 0.9rem; }
  h2 { font-size: 1.6rem; }
}
`;
