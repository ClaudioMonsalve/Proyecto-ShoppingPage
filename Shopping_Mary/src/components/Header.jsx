import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShoppingBag, FaUserCircle, FaInfoCircle } from "react-icons/fa";

export default function Header({ carrito }) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const ADMIN_EMAIL = "claudiomonsalve1287@gmail.com";
  const totalProductos = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.navContainer}>
        {/* === IZQUIERDA === */}
        <div style={styles.logo} onClick={handleLogoClick}>
          <h1 style={styles.logoText}>NovaShop</h1>
        </div>

        {/* === DERECHA === */}
        <div style={styles.rightSection}>
          {/* Sobre Nosotros */}
          <FaInfoCircle
            size={25}
            color="#ffb347"
            style={styles.icon}
            onClick={() => navigate("/about")}
            title="Sobre Nosotros"
          />

          {/* Carrito */}
          <div style={styles.cart} onClick={() => navigate("/carrito")}>
            <FaShoppingBag size={24} />
            {totalProductos > 0 && (
              <span style={styles.badge}>{totalProductos}</span>
            )}
          </div>

          {/* Usuario */}
          <div style={{ position: "relative" }}>
            <FaUserCircle
              size={28}
              style={styles.userIcon}
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div style={styles.dropdown}>
                {user ? (
                  <>
                    <p style={styles.userName}>
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    {user.email === ADMIN_EMAIL && (
                      <button
                        onClick={() => {
                          navigate("/admin");
                          setShowMenu(false);
                        }}
                        style={styles.adminBtn}
                      >
                        ⚙️ Panel Admin
                      </button>
                    )}
                    <button onClick={signOut} style={styles.logoutBtn}>
                      🚪 Cerrar sesión
                    </button>
                  </>
                ) : (
                  <button onClick={signInWithGoogle} style={styles.loginBtn}>
                    🔑 Iniciar sesión con Google
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// === 🎨 ESTILOS ===
const styles = {
  header: {
    position: "sticky",
    top: 0,
    width: "100%",
    backdropFilter: "blur(12px)",
    background: "rgba(15,15,15,0.85)",
    color: "white",
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
  },
  navContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 30px",
  },
  logo: {
    cursor: "pointer",
    marginRight: "auto", // 👈 empuja todo a la derecha
  },
  logoText: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "700",
    fontSize: "1.6rem",
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    margin: 0,
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  icon: {
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  cart: {
    position: "relative",
    cursor: "pointer",
    color: "#fff",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    backgroundColor: "#ff5c8d",
    color: "white",
    borderRadius: "50%",
    fontSize: "0.7rem",
    padding: "3px 6px",
    fontWeight: "bold",
    boxShadow: "0 0 6px rgba(255, 92, 141, 0.8)",
  },
  userIcon: {
    cursor: "pointer",
    color: "#ffb347",
    transition: "transform 0.2s ease",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "40px",
    backgroundColor: "#1f1f1f",
    borderRadius: "10px",
    padding: "15px",
    minWidth: "210px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    textAlign: "center",
    animation: "fadeIn 0.25s ease-out",
  },
  userName: {
    fontSize: "0.95rem",
    marginBottom: "10px",
    color: "#ffb347",
  },
  loginBtn: {
    background: "linear-gradient(90deg, #ff5c8d, #ffb347)",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "8px 10px",
    width: "100%",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "#ff4040",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "8px 10px",
    width: "100%",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "6px",
  },
  adminBtn: {
    background: "#00c46a",
    border: "none",
    color: "white",
    borderRadius: "6px",
    padding: "8px 10px",
    width: "100%",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "6px",
  },
};

// Animación
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
