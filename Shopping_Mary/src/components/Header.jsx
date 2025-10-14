import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { supabase } from "../supabaseClient";

export default function Header({ carrito }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Captura token de URL después de login
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token) {
        supabase.auth.setSession({ access_token, refresh_token })
          .then(({ data, error }) => {
            if (!error) setUser(data.user);
            window.history.replaceState({}, document.title, "/"); // limpia la URL
          });
      }
    }

    // Comprueba si ya hay usuario en sesión
    const currentUser = supabase.auth.user();
    if (currentUser) setUser(currentUser);
  }, []);

  // Contador total de productos en carrito
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  const handleLogin = async () => {
    // Redirige a login con Google
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error("Error login Google:", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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

      {/* Carrito */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link
          to="/carrito"
          style={{ position: "relative", fontSize: "1.6rem", color: "white", textDecoration: "none" }}
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

        {/* Perfil */}
        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={28}
            style={{ cursor: "pointer" }}
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "35px",
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                overflow: "hidden",
                minWidth: "150px",
                zIndex: 10,
              }}
            >
              {user ? (
                <>
                  <div style={{ padding: "10px" }}>Hola, {user.user_metadata.full_name || user.email}</div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "none",
                      backgroundColor: "#ff4d4d",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "none",
                    backgroundColor: "#646cff",
                    color: "#fff",
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
