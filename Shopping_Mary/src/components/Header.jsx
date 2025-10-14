import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { supabase } from "../supabaseClient"; // tu configuración de Supabase

export default function Header({ carrito }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Contador total de productos en el carrito
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  // Manejar login con Google
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error("Error login:", error.message);
  };

  // Manejar logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logout:", error.message);
    else setUser(null);
  };

  // Detectar usuario al cargar la página
  useEffect(() => {
    // Captura el token cuando Supabase redirige después del login
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl();
      if (error) console.error("Error leyendo sesión:", error.message);
      if (data?.session?.user) setUser(data.session.user);
      // Limpia la URL
      window.history.replaceState({}, document.title, "/");
    };

    handleAuthRedirect();

    // También verificar si ya hay sesión activa
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) setUser(data.session.user);
    });

    // Escuchar cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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

      {/* Carrito + Perfil */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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

        {/* Perfil */}
        <div style={{ position: "relative" }}>
          <FaUserCircle
            size={28}
            style={{ cursor: "pointer" }}
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "35px",
                backgroundColor: "white",
                color: "black",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                minWidth: "150px",
                zIndex: 10,
                overflow: "hidden"
              }}
            >
              {user ? (
                <>
                  <p style={{ padding: "10px", margin: 0 }}>
                    Hola, {user.email || user.user_metadata.full_name}
                  </p>
                  <button
                    style={{
                      padding: "10px",
                      width: "100%",
                      border: "none",
                      backgroundColor: "#646cff",
                      color: "white",
                      cursor: "pointer"
                    }}
                    onClick={logout}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  style={{
                    padding: "10px",
                    width: "100%",
                    border: "none",
                    backgroundColor: "#646cff",
                    color: "white",
                    cursor: "pointer"
                  }}
                  onClick={loginWithGoogle}
                >
                  Iniciar sesión con Google
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
