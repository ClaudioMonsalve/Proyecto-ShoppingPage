import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ carrito }) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Contador de productos en carrito
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);

      // 🧾 Mostrar el correo detectado (para pruebas)
      if (currentUser) {
        console.log("✅ Usuario autenticado:", currentUser.email);
      } else {
        console.log("❌ No hay usuario autenticado");
      }
    };

    getCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 🧾 Mostrar correo cuando cambia la sesión
      if (currentUser) {
        console.log("🔄 Cambio de sesión detectado. Usuario:", currentUser.email);
      } else {
        console.log("🚪 Usuario cerró sesión");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://proyecto-shopping-page.vercel.app",
      },
    });
  };

  // Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#242424",
        color: "white",
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <FaHome size={28} />
        <h1 style={{ margin: 0 }}>E-Commerce</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* Carrito */}
        <Link
          to="/carrito"
          style={{
            position: "relative",
            fontSize: "1.6rem",
            color: "white",
            textDecoration: "none",
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
                fontWeight: "bold",
              }}
            >
              {totalProductos}
            </span>
          )}
        </Link>

        {/* Usuario */}
        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={28}
            style={{ cursor: "pointer" }}
            onClick={() => setShowMenu((prev) => !prev)}
          />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "35px",
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                padding: "10px",
                minWidth: "180px",
              }}
            >
              {user ? (
                <>
                  <p style={{ fontSize: "0.9rem", marginBottom: "10px" }}>{user.email}</p>
                  <button
                    onClick={signOut}
                    style={{
                      width: "100%",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  style={{
                    width: "100%",
                    backgroundColor: "#4285F4",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Entrar con Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
