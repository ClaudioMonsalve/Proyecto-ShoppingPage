import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // ✅ Cargar productos desde Supabase
  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al cargar productos:", error);
    } else {
      setProductos(data);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // ✅ Subir nuevo producto
  const agregarProducto = async () => {
    if (!nombre || !precio) return alert("Nombre y precio son obligatorios");

    const { data, error } = await supabase.from("productos").insert([
      {
        nombre,
        precio: parseFloat(precio),
        descripcion,
      },
    ]);

    if (error) {
      console.error("Error al agregar producto:", error);
    } else {
      setNombre("");
      setPrecio("");
      setDescripcion("");
      fetchProductos(); // actualizar lista
    }
  };

  // ✅ Eliminar producto
  const eliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Seguro quieres eliminar este producto?");
    if (!confirmar) return;

    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar producto:", error);
    } else {
      fetchProductos(); // actualizar lista
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>🛠️ Panel de Administración</h1>

      {/* Formulario para agregar productos */}
      <div style={{ marginBottom: "30px" }}>
        <h2>Agregar Producto</h2>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button
          onClick={agregarProducto}
          style={{
            padding: "6px 12px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Agregar
        </button>
      </div>

      {/* Lista de productos */}
      <div>
        <h2>Productos</h2>
        {productos.length === 0 && <p>No hay productos aún.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {productos.map((p) => (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <div>
                <strong>{p.nombre}</strong> - ${p.precio.toFixed(2)}
                <br />
                {p.descripcion}
              </div>
              <button
                onClick={() => eliminarProducto(p.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 🚀 Futuro: sección de pedidos */}
      <div style={{ marginTop: "40px" }}>
        <h2>Pedidos recibidos</h2>
        <p>(Aquí podrás ver los pedidos que han realizado los clientes)</p>
      </div>
    </div>
  );
}
