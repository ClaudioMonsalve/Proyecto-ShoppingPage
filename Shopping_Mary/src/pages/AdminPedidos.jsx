import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState(() => localStorage.getItem("filtro_pedidos") || "todos"); // 🧠 guarda el último filtro

  // 🧠 Cargar pedidos desde Supabase
  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPedidos(data);
    } catch (err) {
      console.error("❌ Error cargando pedidos:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // 🧾 Actualizar estado o pago
  const actualizarPedido = async (id, campo, valor) => {
    try {
      const body = { id };
      if (campo === "estado") body.estado = valor;
      if (campo === "estado_pago") body.estado_pago = valor;

      const res = await fetch("/api/update_pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar pedido");
      }

      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, [campo]: valor } : p
        )
      );
    } catch (err) {
      alert("❌ Error al actualizar: " + err.message);
    }
  };



  const cerrarDetalle = () => setDetalle(null);

  // 🎯 Aplicar filtro
  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "entregados") return p.estado === "entregado";
    if (filtro === "activos") return p.estado !== "entregado";
    return true;
  });

  // 🧠 Guardar filtro en localStorage
  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    localStorage.setItem("filtro_pedidos", nuevo);
  };

  // 🧱 Render
  if (cargando)
    return <p style={{ textAlign: "center", color: "#ccc" }}>Cargando pedidos...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>❌ {error}</p>;

  return (
    <div style={st.container}>
      <h1 style={st.title}>📦 Panel de Pedidos</h1>

      {/* 🧭 Filtros */}
      <div style={st.filters}>
        <button
          style={{
            ...st.filterBtn,
            backgroundColor: filtro === "todos" ? "#ff8c00" : "#333",
          }}
          onClick={() => cambiarFiltro("todos")}
        >
          🔄 Todos
        </button>
        <button
          style={{
            ...st.filterBtn,
            backgroundColor: filtro === "activos" ? "#17a2b8" : "#333",
          }}
          onClick={() => cambiarFiltro("activos")}
        >
          🚚 Activos
        </button>
        <button
          style={{
            ...st.filterBtn,
            backgroundColor: filtro === "entregados" ? "#28a745" : "#333",
          }}
          onClick={() => cambiarFiltro("entregados")}
        >
          ✅ Entregados
        </button>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <p style={{ color: "#ccc", textAlign: "center" }}>
          No hay pedidos que coincidan con este filtro.
        </p>
      ) : (
        <div style={st.grid}>
          {pedidosFiltrados.map((p) => (
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
                <strong>💰 Total:</strong> ${p.total.toLocaleString()}
              </div>

              <div style={st.badges}>
                <label>
                  <strong>💳 Pago:</strong>
                  <select
                    value={p.estado_pago || "pendiente"}
                    onChange={(e) =>
                      actualizarPedido(p.id, "estado_pago", e.target.value)
                    }
                    style={{
                      ...st.select,
                      backgroundColor:
                        p.estado_pago === "pagado" ? "#28a745" : "#ffc107",
                    }}
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </label>

                <label>
                  <strong>🚚 Estado:</strong>
                  <select
                    value={p.estado || "pendiente"}
                    onChange={(e) =>
                      actualizarPedido(p.id, "estado", e.target.value)
                    }
                    style={{
                      ...st.select,
                      backgroundColor:
                        p.estado === "entregado"
                          ? "#28a745"
                          : p.estado === "en camino"
                          ? "#17a2b8"
                          : "#ffc107",
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en camino">En camino</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </label>
              </div>

              <div style={st.estadoBox}>
                <strong>🧾 Método:</strong> {p.metodo_pago}
              </div>

              <button onClick={() => verDetalle(p)} style={st.detalleBtn}>
                🔍 Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🪟 Modal */}
      {detalle && (
        <div style={st.modalOverlay}>
          <div style={st.modal}>
            <h2>🧾 Detalle del Pedido #{detalle.pedido.id}</h2>
            <p>
              <strong>Cliente:</strong> {detalle.pedido.email}
            </p>
            <p>
              <strong>Total:</strong> ${detalle.pedido.total.toLocaleString()}
            </p>
            <hr style={{ margin: "10px 0", borderColor: "#333" }} />

            <table style={st.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.nombre}</td>
                    <td>{it.cantidad}</td>
                    <td>${it.precio}</td>
                    <td>${it.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={cerrarDetalle} style={st.closeBtn}>
              ✖ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Estilos
const st = {
  container: { padding: "30px", color: "#fff", maxWidth: "1100px", margin: "0 auto" },
  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#ff8c00",
    fontSize: "2rem",
    textShadow: "0 0 8px rgba(255,140,0,0.4)",
  },
  filters: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    transition: "0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    border: "1px solid #333",
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
  badges: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" },
  select: {
    marginLeft: "10px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontWeight: "bold",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  estadoBox: {
    backgroundColor: "#2c2c2c",
    padding: "8px",
    marginTop: "12px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "600",
  },
  detalleBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#111",
    borderRadius: "12px",
    padding: "25px",
    color: "#fff",
    width: "90%",
    maxWidth: "600px",
    boxShadow: "0 0 20px rgba(255,92,141,0.3)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
};
