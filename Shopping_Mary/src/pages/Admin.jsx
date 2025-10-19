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

  // ✅ Cargar productos desde Supabase
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

  // ✅ Subir nuevo producto
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
      if (error.status === 403) {
        alert("🚫 No tienes permisos para agregar productos. Revisa RLS en Supabase.");
      } else {
        alert("❌ Error al agregar producto: " + error.message);
      }
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

  // ✅ Eliminar producto
  const eliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Seguro quieres eliminar este producto?");
    if (!confirmar) return;

    setCargando(true);
    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      if (error.status === 403) {
        alert("🚫 No tienes permisos para eliminar productos. Revisa RLS en Supabase.");
      } else {
        alert("❌ Error al eliminar producto: " + error.message);
      }
      console.error(error);
    } else {
      alert("✅ Producto eliminado correctamente");
      fetchProductos();
    }
    setCargando(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛠️ Panel de Administración</h1>

      {/* Formulario de nuevo producto */}
      <div style={{ marginBottom: "30px" }}>
        <h2>Agregar Producto</h2>
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
        <input type="text" placeholder="Imagen (URL)" value={imagen} onChange={(e) => setImagen(e.target.value)} />
        <input type="text" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button onClick={agregarProducto} disabled={cargando}>
          {cargando ? "Cargando..." : "Agregar"}
        </button>
      </div>

      {/* Lista de productos */}
      <div>
        <h2>Productos</h2>
        {cargando && <p>Cargando productos...</p>}
        {productos.length === 0 && !cargando && <p>No hay productos aún.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {productos.map((p) => (
            <li key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", border: "1px solid #ccc", padding: "10px" }}>
              <div>
                <strong>{p.nombre}</strong> - ${p.precio.toFixed(2)} | Stock: {p.stock}
                {p.imagen && <img src={p.imagen} alt={p.nombre} style={{ width: "80px", height: "80px", objectFit: "cover", marginLeft: "10px" }} />}
                <p>{p.descripcion}</p>
              </div>
              <button onClick={() => eliminarProducto(p.id)} disabled={cargando}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Futuro: Pedidos */}
      <div style={{ marginTop: "40px" }}>
        <h2>Pedidos recibidos</h2>
        <p>(Aquí podrás ver los pedidos que han realizado los clientes)</p>
      </div>
    </div>
  );
}
