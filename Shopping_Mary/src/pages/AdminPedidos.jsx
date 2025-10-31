import { useEffect, useState } from "react";

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fetchPedidos = async () => {
    const res = await fetch("/api/get_pedidos");
    const data = await res.json();
    setPedidos(data.pedidos || []);
    setCargando(false);
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    await fetch("/api/update_pedidos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado: nuevoEstado }),
    });
    fetchPedidos();
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  if (cargando) return <p style={{ color: "#fff" }}>Cargando pedidos...</p>;

  return (
    <div style={{ color: "#fff", padding: 20 }}>
      <h1>📦 Administración de Pedidos</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.email}</td>
              <td>${p.total}</td>
              <td>{p.estado_pago}</td>
              <td>{p.estado}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>
                <select
                  value={p.estado}
                  onChange={(e) => actualizarEstado(p.id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en camino">En camino</option>
                  <option value="entregado">Entregado</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
