import React, { useState, useEffect } from "react";

export default function Carrito({ carrito, setCarrito }) {
  const [loading, setLoading] = useState(false);
  const [carritoLocal, setCarritoLocal] = useState(() => {
    const saved = localStorage.getItem("carrito");
    return saved ? JSON.parse(saved) : carrito;
  });

  // ✨ Estados del modal y verificación
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState("form"); // form | code
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [region, setRegion] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // sincronizar carrito
  useEffect(() => {
    setCarrito(carritoLocal);
    localStorage.setItem("carrito", JSON.stringify(carritoLocal));
  }, [carritoLocal, setCarrito]);

  useEffect(() => {
    if (email) localStorage.setItem("email", email);
  }, [email]);

  // 🧮 funciones básicas
  const eliminarProducto = (id) =>
    setCarritoLocal(carritoLocal.filter((p) => p.id !== id));

  const aumentarCantidad = (id) =>
    setCarritoLocal(
      carritoLocal.map((p) =>
        p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
      )
    );

  const reducirCantidad = (id) =>
    setCarritoLocal(
      carritoLocal.map((p) =>
        p.id === id
          ? { ...p, cantidad: p.cantidad > 1 ? p.cantidad - 1 : 1 }
          : p
      )
    );

  const total = carritoLocal.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  // ============================
  //    🧾 VERIFICACIÓN EMAIL
  // ============================
  const pagar = () => {
    if (carritoLocal.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    setShowModal(true);
  };

  const enviarCodigo = async () => {
    if (
      !email ||
      !telefono ||
      !direccion ||
      !ciudad ||
      !region ||
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)
    ) {
      alert("⚠️ Completa todos los campos y usa un Gmail válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/send_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        alert("📩 Código enviado a tu Gmail");
        setStep("code");
      } else {
        alert("❌ Error al enviar el código");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/verify_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Verificación exitosa");
        confirmarPago(); // pasa al pago
      } else {
        alert("❌ Código inválido");
      }
    } catch (err) {
      console.error("Error al verificar código:", err);
      alert("❌ Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  //       💳 CREAR PAGO
  // ============================
  const confirmarPago = async () => {
    setLoading(true);

    const datosCliente = { email, telefono, direccion, ciudad, region };
    const items = carritoLocal.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
    }));

    try {
      const res = await fetch("/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items, ...datosCliente }),
      });

      const data = await res.json();
      if (data.init_point) {
        setShowModal(false);
        localStorage.removeItem("carrito");
        setCarritoLocal([]);
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

  // ============================
  //        🎨 RENDER
  // ============================
  if (carritoLocal.length === 0)
    return (
      <div style={styles.container}>
        <h2 style={styles.titulo}>🛒 Carrito</h2>
        <p style={styles.textoVacio}>Tu carrito está vacío</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>🛒 Carrito</h2>

      <div style={styles.grid}>
        {carritoLocal.map((p) => {
          const imagenBase64 = p.imagen ? byteaToBase64(p.imagen) : null;
          return (
            <div key={p.id} style={styles.card}>
              {imagenBase64 ? (
                <img
                  src={`data:image/png;base64,${imagenBase64}`}
                  alt={p.nombre}
                  style={styles.imagen}
                />
              ) : (
                <div style={styles.imgPlaceholder}>Sin imagen</div>
              )}
              <div style={styles.info}>
                <h3 style={styles.nombre}>{p.nombre}</h3>
                <p style={styles.precio}>${p.precio.toFixed(2)}</p>

                <div style={styles.cantidadContainer}>
                  <button
                    style={styles.cantidadBtn}
                    onClick={() => reducirCantidad(p.id)}
                  >
                    −
                  </button>
                  <span style={styles.cantidad}>{p.cantidad}</span>
                  <button
                    style={styles.cantidadBtn}
                    onClick={() => aumentarCantidad(p.id)}
                  >
                    +
                  </button>
                </div>

                <p style={styles.subtotal}>
                  Subtotal: ${(p.precio * p.cantidad).toFixed(2)}
                </p>

                <button
                  style={styles.eliminarBtn}
                  onClick={() => eliminarProducto(p.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.totalContainer}>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button style={styles.pagarBtn} onClick={pagar} disabled={loading}>
          {loading ? "Cargando..." : "Pagar"}
        </button>
      </div>

      {/* ✨ Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {step === "form" && (
              <>
                <h3>Datos del cliente 📦</h3>
                <input
                  type="email"
                  placeholder="Correo Gmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Región"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={styles.input}
                />

                <button
                  style={styles.confirmBtn}
                  onClick={enviarCodigo}
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </>
            )}

            {step === "code" && (
              <>
                <h3>Verifica tu correo 📩</h3>
                <p>Te enviamos un código a {email}</p>
                <input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.confirmBtn}
                  onClick={verificarCodigo}
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Confirmar"}
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setStep("form")}
                  disabled={loading}
                >
                  Volver
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ====================
// Helper y estilos
// ====================
const byteaToBase64 = (bytea) => {
  if (!bytea) return null;
  const hex = bytea.startsWith("\\x") ? bytea.slice(2) : bytea;
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return btoa(str);
};

const styles = {
  container: { padding: "30px", maxWidth: "1200px", margin: "0 auto", minHeight: "100vh" },
  titulo: { color: "#ff5c8d", fontSize: "2rem", marginBottom: "20px", textAlign: "center" },
  textoVacio: { color: "#ccc", textAlign: "center", marginTop: "50px", fontSize: "1.2rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  card: { display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "15px" },
  imagen: { width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "15px", marginBottom: "12px" },
  imgPlaceholder: { width: "100%", height: "180px", backgroundColor: "#333", color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center" },
  info: { display: "flex", flexDirection: "column", gap: "6px", color: "white" },
  nombre: { fontSize: "1.2rem", fontWeight: "700", color: "#ffb347" },
  precio: { fontSize: "1rem", fontWeight: "bold", color: "#ff5c8d" },
  cantidadContainer: { display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" },
  cantidadBtn: { backgroundColor: "#646cff", color: "white", border: "none", borderRadius: "8px", padding: "5px 10px", cursor: "pointer" },
  cantidad: { minWidth: "20px", textAlign: "center", fontWeight: "bold" },
  subtotal: { marginTop: "5px", fontSize: "0.95rem", color: "#ccc" },
  eliminarBtn: { marginTop: "8px", padding: "8px", borderRadius: "8px", border: "none", backgroundColor: "red", color: "white", cursor: "pointer" },
  totalContainer: { marginTop: "30px", textAlign: "right", color: "white" },
  pagarBtn: { marginTop: "10px", padding: "12px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #ff5c8d, #ffb347)", color: "white", fontWeight: "bold", cursor: "pointer" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#111", padding: "25px", borderRadius: "14px", width: "90%", maxWidth: "420px", color: "white", textAlign: "center", boxShadow: "0 0 15px rgba(255,92,141,0.5)" },
  input: { display: "block", width: "80%", margin: "8px auto", padding: "10px", borderRadius: "8px", border: "1px solid #ff5c8d", fontSize: "1rem", backgroundColor: "#222", color: "white" },
  confirmBtn: { margin: "10px", padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  cancelBtn: { margin: "10px", padding: "10px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
};
