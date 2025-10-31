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
  const [busqueda, setBusqueda] = useState("");
  const [modoEditar, setModoEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // Cargar productos
  const fetchProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: true });
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

  // Preview de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    if (!file) return setImagenPreview(null);
    const reader = new FileReader();
    reader.onload = () => setImagenPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Convertir file a bytea
  const fileToBytea = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let hex = "\\x";
    bytes.forEach((b) => (hex += b.toString(16).padStart(2, "0")));
    return hex;
  };

  // Agregar producto
  const agregarProducto = async () => {
    if (!nombre || !precio || !stock)
      return alert("Nombre, precio y stock son obligatorios");
    setCargando(true);

    let imagenBytea = null;
    if (imagenFile) {
      imagenBytea = await fileToBytea(imagenFile);
    }

    const { error } = await supabase.from("productos").insert([
      {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagenBytea,
        descripcion,
      },
    ]);

    if (error) alert("❌ Error al agregar producto: " + error.message);
    else {
      alert("✅ Producto agregado correctamente");
      limpiarFormulario();
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

  // Iniciar edición
  const editarProducto = (producto) => {
    setModoEditar(true);
    setProductoEditando(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
    setDescripcion(producto.descripcion || "");
    setImagenPreview(
      producto.imagen ? `data:image/png;base64,${hexToBase64(producto.imagen)}` : null
    );
    setImagenFile(null);
  };

  // Actualizar producto
  const actualizarProducto = async () => {
    if (!productoEditando) return;
    if (!nombre || !precio || !stock)
      return alert("⚠️ Nombre, precio y stock son obligatorios");

    setCargando(true);

    try {
      let imagenBytea = productoEditando.imagen; // mantener la anterior por defecto

      // ✅ Si el usuario sube una nueva imagen, convertirla a bytea
      if (imagenFile) {
        imagenBytea = await fileToBytea(imagenFile);
      }

      // ✅ Asegurar que siempre tenga el formato \xHEX...
      if (imagenBytea && !imagenBytea.startsWith("\\x")) {
        imagenBytea = "\\x" + imagenBytea.replace(/^0x/, "");
      }

      // ✅ Ejecutar UPDATE con todos los campos, incluida imagen
      const { data, error } = await supabase
        .from("productos")
        .update({
          nombre: nombre.trim(),
          precio: parseFloat(precio),
          stock: parseInt(stock),
          descripcion: descripcion.trim(),
          imagen: imagenBytea, // ← clave: pasar el bytea bien formateado
        })
        .eq("id", productoEditando.id)
        .select("*");

      if (error) {
        console.error("❌ Error Supabase:", error);
        alert("❌ No se pudo actualizar la imagen: " + error.message);
      } else {
        alert("✅ Producto actualizado correctamente (incluida imagen)");
        await fetchProductos(); // recarga los productos desde la BD
        limpiarFormulario();
      }
    } catch (err) {
      console.error("⚠️ Error inesperado:", err);
      alert("⚠️ Error inesperado: " + err.message);
    }

    setCargando(false);
  };



  const limpiarFormulario = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setDescripcion("");
    setImagenFile(null);
    setImagenPreview(null);
    setModoEditar(false);
    setProductoEditando(null);
  };

  // Filtrar productos
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto", color: "#fff" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>🛠️ Panel de Administración</h1>

      {/* Formulario agregar/editar producto */}
      <div style={{ marginBottom: 20, padding: 20, backgroundColor: "#2c2c2c", borderRadius: 10 }}>
        <h2>{modoEditar ? "✏️ Editar Producto" : "Agregar Producto"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
          <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
          {imagenPreview && (
            <img src={imagenPreview} alt="Preview" style={{ gridColumn: "1 / 3", maxHeight: 150, objectFit: "cover", borderRadius: 8 }} />
          )}
          <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ ...inputStyle, gridColumn: "1 / 3" }}
          />
        </div>

        <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
          <button
            onClick={modoEditar ? actualizarProducto : agregarProducto}
            disabled={cargando}
            style={buttonStyle}
          >
            {cargando ? "Cargando..." : modoEditar ? "Actualizar" : "Agregar"}
          </button>
          {modoEditar && (
            <button onClick={limpiarFormulario} style={cancelButtonStyle}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "2px solid #ff8c00",
            fontSize: "1rem",
            backgroundColor: "#1f1f1f",
            color: "#fff",
          }}
        />
      </div>

      {/* Lista de productos */}
      <div>
        <h2 style={{ marginBottom: 15 }}>Productos</h2>
        {cargando && <p>Cargando productos...</p>}
        {productosFiltrados.length === 0 && !cargando && <p>No hay productos que coincidan.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 15 }}>
          {productosFiltrados.map((p) => (
            <li key={p.id} style={productCardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                {p.imagen && (
                  <img
                    src={`data:image/png;base64,${hexToBase64(p.imagen)}`}
                    alt={p.nombre}
                    style={imgStyle}
                  />
                )}
                <div>
                  <strong>{p.nombre}</strong> - ${p.precio.toFixed(2)} | Stock: {p.stock}
                  <p style={{ margin: "5px 0 0 0", color: "#bbb" }}>{p.descripcion}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => editarProducto(p)}
                  disabled={cargando}
                  style={editButtonStyle}
                >
                  Modificar
                </button>
                <button
                  onClick={() => eliminarProducto(p.id)}
                  disabled={cargando}
                  style={deleteButtonStyle}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Convertir bytea hex a Base64
function hexToBase64(hex) {
  if (!hex) return "";
  if (hex.startsWith("\\x")) hex = hex.slice(2);
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

// Estilos
const inputStyle = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #555",
  backgroundColor: "#1f1f1f",
  color: "#fff",
  fontSize: "1rem",
};
const buttonStyle = {
  padding: "12px 25px",
  backgroundColor: "#ff8c00",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
const cancelButtonStyle = {
  padding: "12px 25px",
  backgroundColor: "#555",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
const editButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
const deleteButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
const productCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 15,
  backgroundColor: "#1f1f1f",
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};
const imgStyle = { width: 80, height: 80, objectFit: "cover", borderRadius: 6 };
