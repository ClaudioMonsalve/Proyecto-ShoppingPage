import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Home({ carrito, setCarrito }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("productos").select("*").order("id", { ascending: true });
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
    const prodExistente = carrito.find((p) => p.id === producto.id);
    if (prodExistente) {
      setCarrito(carrito.map((p) => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const productosFiltrados = productos.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) return <p style={{ color: "white", textAlign: "center" }}>Cargando productos...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ color: "white", marginBottom: 20, textAlign: "center" }}>🛍️ Productos</h2>
      <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginBottom: 20, fontSize: "1rem" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {productosFiltrados.map((p) => (
          <div key={p.id} style={{ backgroundColor: "#2c2c2c", padding: 15, borderRadius: 10, color: "#fff" }}>
            {p.imagen && <img src={`data:image/png;base64,${hexToBase64(p.imagen)}`} alt={p.nombre} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 6 }} />}
            <h3>{p.nombre}</h3>
            <p>${p.precio.toFixed(2)}</p>
            <p style={{ fontSize: "0.85rem", color: "#bbb" }}>{p.descripcion}</p>
            <button onClick={() => agregarAlCarrito(p)} style={{ marginTop: 10, padding: "8px 12px", border: "none", borderRadius: 6, backgroundColor: "#ff8c00", color: "#fff", cursor: "pointer" }}>Agregar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// misma función de conversión hex → base64
function hexToBase64(hex) {
  if (!hex) return "";
  if (hex.startsWith("\\x")) hex = hex.slice(2);
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}
