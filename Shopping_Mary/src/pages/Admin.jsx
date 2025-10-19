import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);

  // Cargar productos
  const fetchProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase.from("productos").select("*").order("id", { ascending: true });
    if (error) {
      alert("❌ Error al cargar productos: " + error.message);
      console.error(error);
    } else {
      setProductos(data);
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Agregar producto
  const agregarProducto = async () => {
    if (!nombre || !precio || !stock) return alert("Nombre, precio y stock son obligatorios");
    setCargando(true);
    const { data, error } = await supabase.from("productos").insert([
      {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagen || null,
        descripcion,
      },
    ]);

    if (error) {
      if (error.status === 403) alert("🚫 No tienes permisos para agregar productos.");
      else alert("❌ Error al agregar producto: " + error.message);
      console.error(error);
    } else {
      alert("✅ Producto agregado correctamente");
      setNombre("");
      setPrecio("");
      setStock("");
      setImagen("");
      setDescripcion("");
      fetchProductos();
    }
    setCargando(false);
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar este producto?")) return;
    setCargando(true);
    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      if (error.status === 403) alert("🚫 No tienes permisos para eliminar productos.");
      else alert("❌ Error al eliminar producto: " + error.message);
      console.error(error);
    } else {
      alert("✅ Producto eliminado correctamente");
      fetchProductos();
    }
    setCargando(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🛠️ Panel de Administración</h1>

      {/* Formulario */}
      <div style={{ marginBottom: "40px", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "15px" }}>Agregar Producto</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          <input placeholder="Imagen (URL)" value={imagen} onChange={(e) => setImagen(e.target.value)} style={inputStyle} />
          <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ ...inputStyle, gridColumn: "1 / 3" }} />
        </div>
        <button onClick={agregarProducto} disabled={cargando} style={buttonStyle}>
          {cargando ? "Cargando..." : "Agregar"}
        </button>
      </div>

      {/* Lista de productos */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "15px" }}>Productos</h2>
        {cargando && <p>Cargando productos...</p>}
        {productos.length === 0 && !cargando && <p>No hay productos aún.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "15px" }}>
          {productos.map((p) => (
            <li key={p.id} style={productCardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {p.imagen && <img src={p.imagen} alt={p.nombre} style={imgStyle} />}
                <div>
                  <strong>{p.nombre}</strong> - ${p.precio.toFixed(2)} | Stock: {p.stock}
                  <p style={{ margin: "5px 0 0 0", color: "#555" }}>{p.descripcion}</p>
                </div>
              </div>
              <button onClick={() => eliminarProducto(p.id)} disabled={cargando} style={deleteButtonStyle}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pedidos */}
      <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", boxShadow: "0 3px 10px rgba(0,0,0,0.05)" }}>
        <h2>Pedidos recibidos</h2>
        <p>(Aquí podrás ver los pedidos que han realizado los clientes)</p>
      </div>
    </div>
  );
}

// Estilos reutilizables
const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const buttonStyle = {
  marginTop: "15px",
  padding: "12px 25px",
  backgroundColor: "#242424",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const productCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const imgStyle = {
  width: "80px",
  height: "80px",
  objectFit: "cover",
  borderRadius: "6px",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
