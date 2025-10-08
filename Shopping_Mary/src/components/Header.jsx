import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaUserCircle, FaHome } from "react-icons/fa";

export default function Header({ carrito }) {
  const [usuario, setUsuario] = useState(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUsuario(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) setUsuario(session.user);
        else setUsuario(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setMostrarDropdown(false);
  };

  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between", // 👈 logo izquierda / íconos derecha
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#242424",
        color: "white",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* 🏠 Logo a la izquierda */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <FaHome size={28} />
        <h1 style={{ margin: 0 }}>E-Commerce</h1>
      </div>

      {/* 🛒 + 👤 íconos a la derecha */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link
          to="/carrito"
          style={{
            cursor: "pointer",
            fontSize: "1.6rem",
            color: "white",
            textDecoration: "none",
            position: "relative"
          }}
        >
          🛒
          {totalProductos > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 7px",
                fontSize: "0.8rem",
                fontWeight: "bold"
              }}
            >
              {totalProductos}
            </span>
          )}
        </Link>

        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={35}
            style={{ cursor: "pointer" }}
            onClick={() => setMostrarDropdown(!mostrarDropdown)}
          />

          {mostrarDropdown && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                backgroundColor: "#333",
                color: "white",
                borderRadius: "8px",
                padding: "10px",
                minWidth: "180px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10
              }}
            >
              {!usuario ? (
                <p style={{ margin: 0, textAlign: "center" }}>
                  Primero debes{" "}
                  <span style={{ color: "#646cff", cursor: "pointer" }} onClick={loginWithGoogle}>
                    registrar
                  </span>{" "}
                  o{" "}
                  <span style={{ color: "#646cff", cursor: "pointer" }} onClick={loginWithGoogle}>
                    ingresar
                  </span>
                </p>
              ) : (
                <>
                  <p style={{ marginBottom: "10px", textAlign: "center" }}>
                    Hola, {usuario.email}
                  </p>
                  <button
                    style={{
                      width: "100%",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#646cff",
                      color: "white"
                    }}
                    onClick={() => alert("Mostrar datos del perfil")}
                  >
                    Datos del perfil
                  </button>
                  <button
                    style={{
                      width: "100%",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "5px",
                      backgroundColor: "red",
                      color: "white"
                    }}
                    onClick={logout}
                  >
                    Salir
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

