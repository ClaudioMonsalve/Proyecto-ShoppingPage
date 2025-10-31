import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const res = await fetch("/api/get_pedidos");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al obtener pedidos");

        // 🧠 Ordenar por fecha (más recientes primero)
        const ordenados = data.pedidos.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setPedidos(ordenados);
      } catch (err) {
        console.error("❌ Error cargando pedidos:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    fetchPedidos();
  }, []);

  if (cargando)
    return <p style={{ textAlign: "center", color: "#ccc" }}>Cargando pedidos...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>❌ {error}</p>;

  return (
    <div style={st.container}>
      <h1 style={st.title}>📦 Panel de Pedidos</h1>

      {pedidos.length === 0 ? (
        <p style={{ color: "#ccc", textAlign: "center" }}>No hay pedidos registrados aún.</p>
      ) : (
        <div style={st.grid}>
          {pedidos.map((p) => (
            <div key={p.id} style={st.card}>
              <div style={st.header}>
                <span style={st.id}>Pedido #{p.id}</span>
                <span style={st.fecha}>
                  {new Date(p.created_at).toLocaleString("es-CL")}
                </span>
              </div>

              <div style={st.row}>
                <strong>📧 Cliente:</strong> {p.email}
              </div>
              <div style={st.row}>
                <strong>📍 Dirección:</strong>{" "}
                {p.direccion}, {p.ciudad}, {p.region}
              </div>
              <div style={st.row}>
                <strong>💰 Total:</strong> ${p.total.toLocaleString()}
              </div>

              <div style={st.badges}>
                <span
                  style={{
                    ...st.badge,
                    backgroundColor:
                      p.estado_pago === "pagado" ? "#28a745" : "#ffc107",
                  }}
                >
                  {p.estado_pago.toUpperCase()}
                </span>
                <span
                  style={{
                    ...st.badge,
                    backgroundColor:
                      p.metodo_pago === "efectivo" ? "#ff5c8d" : "#007bff",
                  }}
                >
                  {p.metodo_pago.toUpperCase()}
                </span>
              </div>

              <div style={st.estadoBox}>
                <strong>🚚 Estado actual:</strong> {p.estado}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🎨 Estilos modernos
const st = {
  container: {
    padding: "30px",
    color: "#fff",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#ff8c00",
    fontSize: "2rem",
    textShadow: "0 0 8px rgba(255,140,0,0.4)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "1px solid #333",
    transition: "transform 0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    borderBottom: "1px solid #333",
    paddingBottom: "6px",
  },
  id: { fontWeight: "bold", color: "#ffb347" },
  fecha: { color: "#999", fontSize: "0.9rem" },
  row: { margin: "6px 0" },
  badges: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "8px",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "0.8rem",
    letterSpacing: "0.5px",
  },
  estadoBox: {
    backgroundColor: "#2c2c2c",
    padding: "8px",
    marginTop: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "600",
  },
};
