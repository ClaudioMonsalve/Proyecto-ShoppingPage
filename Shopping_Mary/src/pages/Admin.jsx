import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);

  // Cargar productos
  const fetchProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase.from("productos").select("*").order("id", { ascending: true });
    if (error) {
      alert("❌ Error al cargar productos: " + error.message);
      setCargando(false);
      return;
    }
    setProductos(data);
    setCargando(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // Manejar cambio de archivo y generar preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagenFile(null);
    setImagenPreview(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // ArrayBuffer para bytea
        setImagenFile(reader.result);
        // Preview para mostrar en la UI
        setImagenPreview(URL.createObjectURL(file));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Insertar producto
  const agregarProducto = async () => {
    if (!nombre || !precio || !stock) return alert("Nombre, precio y stock son obligatorios");
    setCargando(true);

    const { error } = await supabase.from("productos").insert([
      {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagenFile, // bytea
        descripcion,
      },
    ]);

    if (error) {
      alert("❌ Error al agregar producto: " + error.message);
    } else {
      alert("✅ Producto agregado correctamente");
      setNombre(""); setPrecio(""); setStock(""); setImagenFile(null); setImagenPreview(null); setDescripcion("");
      fetchProductos();
    }
    setCargando(false);
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar este producto?")) return;
    setCargando(true);
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) alert("❌ Error al eliminar producto: " + error.message);
    else fetchProductos();
    setCargando(false);
  };

  // Convertir bytea a URL para mostrar
  const getImagenUrl = (byteaData) => {
    if (!byteaData) return null;
    const blob = new Blob([new Uint8Array(byteaData)], { type: "image/png" });
    return URL.createObjectURL(blob);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", color: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🛠️ Panel de Administración</h1>

      {/* Formulario */}
      <div style={formContainerStyle}>
        <h2>Agregar Producto</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
          {imagenPreview && <img src={imagenPreview} alt="Preview" style={{ gridColumn: "1 / 3", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }} />}
          <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={{ ...inputStyle, gridColumn: "1 / 3" }} />
        </div>
        <button onClick={agregarProducto} disabled={cargando} style={buttonStyle}>
          {cargando ? "Cargando..." : "Agregar"}
        </button>
      </div>

      {/* Lista de productos */}
      <div>
        <h2 style={{ marginBottom: "15px" }}>Productos</h2>
        {cargando && <p>Cargando productos...</p>}
        {productos.length === 0 && !cargando && <p>No hay productos aún.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "15px" }}>
          {productos.map((p) => (
            <li key={p.id} style={productCardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {p.imagen && <img src={getImagenUrl(p.imagen)} alt={p.nombre} style={imgStyle} />}
                <div>
                  <strong>{p.nombre}</strong> - ${p.precio.toFixed(2)} | Stock: {p.stock}
                  <p style={{ margin: "5px 0 0 0", color: "#bbb" }}>{p.descripcion}</p>
                </div>
              </div>
              <button onClick={() => eliminarProducto(p.id)} disabled={cargando} style={deleteButtonStyle}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Estilos
const formContainerStyle = { marginBottom: "40px", padding: "20px", backgroundColor: "#2c2c2c", borderRadius: "10px" };
const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #555", backgroundColor: "#1f1f1f", color: "#fff", fontSize: "1rem" };
const buttonStyle = { marginTop: "15px", padding: "12px 25px", backgroundColor: "#ff8c00", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const productCardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#1f1f1f", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" };
const imgStyle = { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" };
const deleteButtonStyle = { padding: "8px 12px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
