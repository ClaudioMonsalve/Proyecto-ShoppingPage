import React, { useState, useEffect } from "react";

export default function Carrito({ carrito, setCarrito }) {
  const [loading, setLoading] = useState(false);
  const [carritoLocal, setCarritoLocal] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : carrito;
  });

  // Datos del invitado
  const [invitado, setInvitado] = useState({ nombre: "", email: "" });

  // Convierte bytea (hex con \x) a Base64
  const byteaToBase64 = (bytea) => {
    if (!bytea) return null;
    const hex = bytea.startsWith("\\x") ? bytea.slice(2) : bytea;
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return btoa(str);
  };

  // Sincroniza carritoLocal con carrito principal y localStorage
  useEffect(() => {
    setCarrito(carritoLocal);
    localStorage.setItem("carrito", JSON.stringify(carritoLocal));
  }, [carritoLocal, setCarrito]);

  const eliminarProducto = (id) => {
    setCarritoLocal(carritoLocal.filter((producto) => producto.id !== id));
  };

  const aumentarCantidad = (id) => {
    setCarritoLocal(
      carritoLocal.map((p) =>
        p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
      )
    );
  };

  const reducirCantidad = (id) => {
    setCarritoLocal(
      carritoLocal.map((p) =>
        p.id === id
          ? { ...p, cantidad: p.cantidad > 1 ? p.cantidad - 1 : 1 }
          : p
      )
    );
  };

  const total = carritoLocal.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  const pagar = async () => {
    if (carritoLocal.length === 0) return alert("El carrito está vacío");
    if (!invitado.nombre.trim() || !invitado.email.trim())
      return alert("Debes ingresar nombre y email");

    setLoading(true);

    const items = carritoLocal.map((producto) => ({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
    }));

    try {
      const res = await fetch("/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, invitado }),
      });

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("❌ Error al generar la preferencia de pago");
      }
    } catch (err) {
      console.error("❌ Error al procesar el pago:", err);
      alert("❌ Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  if (carritoLocal.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.titulo}>🛒 Carrito</h2>
        <p style={styles.textoVacio}>Tu carrito está vacío</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>🛒 Carrito</h2>

      <div style={styles.grid}>
        {carritoLocal.map((producto) => {
          const imagenBase64 = byteaToBase64(producto.imagen);

          return (
            <div key={producto.id} style={styles.card}>
              {imagenBase64 ? (
                <img
                  src={`data:image/png;base64,${imagenBase64}`}
                  alt={producto.nombre}
                  style={styles.imagen}
                />
              ) : (
                <div style={styles.imgPlaceholder}>Sin imagen</div>
              )}

              <div style={styles.info}>
                <h3 style={styles.nombre}>{producto.nombre}</h3>
                <p style={styles.precio}>${producto.precio.toFixed(2)}</p>

                <div style={styles.cantidadContainer}>
                  <button
                    style={styles.cantidadBtn}
                    onClick={() => reducirCantidad(producto.id)}
                  >
                    −
                  </button>
                  <span style={styles.cantidad}>{producto.cantidad}</span>
                  <button
                    style={styles.cantidadBtn}
                    onClick={() => aumentarCantidad(producto.id)}
                  >
                    +
                  </button>
                </div>

                <p style={styles.subtotal}>
                  Subtotal: ${(producto.precio * producto.cantidad).toFixed(2)}
                </p>

                <button
                  style={styles.eliminarBtn}
                  onClick={() => eliminarProducto(producto.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Datos del invitado */}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nombre"
          value={invitado.nombre}
          onChange={(e) => setInvitado({ ...invitado, nombre: e.target.value })}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={invitado.email}
          onChange={(e) => setInvitado({ ...invitado, email: e.target.value })}
          style={{ padding: "8px" }}
        />
      </div>

      <div style={styles.totalContainer}>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button
          style={styles.pagarBtn}
          onClick={pagar}
          disabled={loading || !invitado.nombre.trim() || !invitado.email.trim()}
        >
          {loading ? "Cargando..." : "Pagar"}
        </button>
      </div>
    </div>
  );
}

// === ESTILOS ===
const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Poppins', sans-serif",
    minHeight: "100vh",
  },
  titulo: {
    color: "#ff5c8d",
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
    textShadow: "0 2px 10px rgba(255,92,141,0.5)",
  },
  textoVacio: {
    color: "#ccc",
    textAlign: "center",
    marginTop: "50px",
    fontSize: "1.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "15px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  imagen: {
    width: "100%",
    height: "auto",
    maxHeight: "200px",
    objectFit: "contain",
    borderRadius: "15px",
    marginBottom: "12px",
    transition: "transform 0.4s",
  },
  imgPlaceholder: {
    width: "100%",
    height: "180px",
    borderRadius: "15px",
    backgroundColor: "#333",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "white",
  },
  nombre: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffb347",
  },
  precio: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#ff5c8d",
  },
  cantidadContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px",
  },
  cantidadBtn: {
    backgroundColor: "#646cff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  cantidad: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: "bold",
  },
  subtotal: {
    marginTop: "5px",
    fontSize: "0.95rem",
    color: "#ccc",
  },
  eliminarBtn: {
    marginTop: "8px",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "red",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  totalContainer: {
    marginTop: "30px",
    textAlign: "right",
    color: "white",
  },
  pagarBtn: {
    marginTop: "10px",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

print("pepe")