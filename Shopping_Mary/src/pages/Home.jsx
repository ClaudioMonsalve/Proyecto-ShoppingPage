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
    padding: "30px",
    maxWidth: "1300px",
    margin: "0 auto",
    fontFamily: "'Poppins', sans-serif",
    background: "linear-gradient(180deg, #121212 0%, #1a1a1a 100%)",
    minHeight: "100vh",
  },
  titulo: {
    color: "#ff5c8d",
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "2rem",
    letterSpacing: "1px",
    textShadow: "0 2px 10px rgba(255,92,141,0.5)",
  },
  inputBusqueda: {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    marginBottom: "25px",
    fontSize: "1rem",
    backgroundColor: "rgba(30,30,30,0.6)",
    color: "white",
    outline: "none",
    transition: "0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    textAlign: "center",
    color: "white",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  imagen: {
    width: "100%",
    height: "auto", // altura automática
    maxHeight: "250px", // límite máximo
    objectFit: "contain", // mantiene proporción
    borderRadius: "15px",
    marginBottom: "12px",
    transition: "transform 0.4s, box-shadow 0.4s",
  },
  imgPlaceholder: {
    width: "100%",
    minHeight: "150px",
    borderRadius: "15px",
    backgroundColor: "#1c1c1c",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  nombre: {
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "5px",
    color: "#ffb347",
  },
  precio: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#ff5c8d",
    marginBottom: "8px",
  },
  descripcion: {
    fontSize: "0.9rem",
    color: "#ccc",
    minHeight: "40px",
    marginBottom: "10px",
  },
  cantidad: {
    fontSize: "0.85rem",
    marginBottom: "10px",
    color: "#aaa",
  },
  boton: {
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  loading: {
    textAlign: "center",
    marginTop: "100px",
    color: "#ff5c8d",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
};
