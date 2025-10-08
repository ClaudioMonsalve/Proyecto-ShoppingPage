export default function Home({ carrito, setCarrito }) {
  // Lista de productos de ejemplo
  const productos = [
    { id: 1, nombre: "Producto 1", precio: 100, imagen: "/producto1.png" },
    { id: 2, nombre: "Producto 2", precio: 200, imagen: "/producto2.png" },
    { id: 3, nombre: "Producto 3", precio: 150, imagen: "/producto3.png" }
  ];

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((p) => p.id === producto.id);
    if (productoExistente) {
      setCarrito(
        carrito.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "white", marginBottom: "20px" }}>Productos</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {productos.map((producto) => {
          // Buscar cantidad actual en el carrito
          const productoEnCarrito = carrito.find((p) => p.id === producto.id);
          const cantidad = productoEnCarrito ? productoEnCarrito.cantidad : 0;

          return (
            <div
              key={producto.id}
              style={{
                backgroundColor: "#fff",
                padding: "15px",
                borderRadius: "8px",
                width: "200px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ width: "100%", borderRadius: "6px" }}
              />
              <h3>{producto.nombre}</h3>
              <p>${producto.precio}</p>
              <p>Cantidad en carrito: {cantidad}</p>
              <button onClick={() => agregarAlCarrito(producto)}>
                Agregar al carrito
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

