import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ carrito }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Contador de productos en carrito
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  useEffect(() => {
    // Captura token de URL después del login
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl();
      if (data?.session?.user) setUser(data.session.user);
      window.history.replaceState({}, document.title, "/");
    };
    handleAuthRedirect();

    // Detecta cambios en sesión
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "#242424", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/")}>
        <FaHome size={28} />
        <h1 style={{ margin: 0 }}>E-Commerce</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link to="/carrito" style={{ position: "relative", fontSize: "1.6rem", color: "white", textDecoration: "none" }}>
          🛒
          {totalProductos > 0 && (
            <span style={{ position: "absolute", top: "-8px", right: "-10px", backgroundColor: "red", color: "white", borderRadius: "50%", padding: "2px 7px", fontSize: "0.8rem", fontWeight: "bold" }}>
              {totalProductos}
            </span>
          )}
        </Link>

        <div style={{ position: "relative" }}>
          <FaUserCircle size={28} style={{ cursor: "pointer" }} onClick={() => setShowMenu((prev) => !prev)} />
          {user ? (
            <div style={{ position: "absolute", right: 0, top: "35px", backgroundColor: "#fff", color: "#000", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", padding: "10px" }}>
              <p>{user.email}</p>
              <button onClick={signOut}>Cerrar sesión</button>
            </div>
          ) : (
            <div style={{ position: "absolute", right: 0, top: "35px", backgroundColor: "#fff", color: "#000", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", padding: "10px" }}>
              <button onClick={signInWithGoogle}>Entrar con Google</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
