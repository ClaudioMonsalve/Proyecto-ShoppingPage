import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function TrackPedido() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [pedido, setPedido] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token no encontrado.");
      setLoading(false);
      return;
    }

    async function fetchPedido() {
      try {
        const res = await fetch(`/api/track_pedido?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPedido(data.pedido);
        setItems(data.items);
      } catch (err) {
        console.error("❌ Error cargando pedido:", err);
        setError("No se pudo cargar la información del pedido.");
      } finally {
        setLoading(false);
      }
    }

    fetchPedido();
  }, [token]);

  if (loading) return <p style={styles.loading}>Cargando pedido...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>📦 Seguimiento de tu pedido</h1>
        <p style={styles.subtitulo}>
          Gracias por tu compra 💖
        </p>

        <div style={styles.infoBox}>
          <p><strong>Correo:</strong> {pedido.email}</p>
          <p><strong>Total:</strong> ${pedido.total}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span style={{
              ...styles.estado,
              backgroundColor:
                pedido.estado === "En camino" ? "#ffc107" :
                pedido.estado === "Entregado" ? "#28a745" : "#17a2b8"
            }}>
              {pedido.estado}
            </span>
          </p>
          <p><strong>Fecha:</strong> {new Date(pedido.created_at).toLocaleString()}</p>
        </div>

        <h3 style={styles.detalleTitulo}>🛍️ Detalle de tu compra</h3>
        <ul style={styles.lista}>
          {items.map((item) => (
            <li key={item.id} style={styles.item}>
              <div>
                <span style={styles.nombre}>{item.nombre}</span>
                <br />
                <span style={styles.cantidad}>
                  {item.cantidad} x ${item.precio}
                </span>
              </div>
              <span style={styles.subtotal}>${item.subtotal}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// =========================
// 🎨 Estilos en JS
// =========================
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff5c8d, #ffb347)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  titulo: {
    fontSize: "1.8rem",
    marginBottom: "10px",
    color: "#333",
  },
  subtitulo: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "20px",
  },
  infoBox: {
    background: "#f7f7f7",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "left",
    marginBottom: "20px",
  },
  estado: {
    padding: "4px 10px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
  },
  detalleTitulo: {
    textAlign: "left",
    fontSize: "1.2rem",
    marginBottom: "10px",
    color: "#333",
  },
  lista: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    textAlign: "left",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  nombre: {
    fontWeight: "600",
    fontSize: "1rem",
    color: "#333",
  },
  cantidad: {
    fontSize: "0.9rem",
    color: "#777",
  },
  subtotal: {
    fontWeight: "600",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "1.2rem",
  },
  error: {
    textAlign: "center",
    marginTop: "50px",
    color: "red",
    fontSize: "1.2rem",
  },
};
