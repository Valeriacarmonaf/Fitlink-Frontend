// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

// Páginas
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Users from "./pages/Users";
import PerfilUsuario from "./pages/PerfilUsuario";
import PerfilPublico from "./pages/PerfilPublico";
import LoginForm from "./pages/Login";
import Sugerencias from "./pages/Sugerencias";
import NormasPage from "./pages/NormasPage";
import RequireAuth from "./components/RequireAuth";
import Chats from "./pages/Chats";
import ChatRoom from "./pages/ChatRoom";
import EventosExitosos from "./pages/EventosExitosos";

const NavLinkClasses =
  "px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150";

// ⭐ Wrapper para pasar el parámetro dinámico a PerfilPublico
function PerfilPublicoWrapper() {
  const { id } = useParams();
  return <PerfilPublico userId={id} />;
}

function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true); // evita 404/flicker
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas válidas (para decidir si la actual existe)
  const knownPaths = new Set([
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/users",
    "/perfil",
    "/sugerencias",
    "/chats",
    "/eventos-exitosos",
  ]);

  // Lee params del hash (#a=b&c=d)
  function parseHashParams(hash) {
    const h = (hash || "").replace(/^#/, "");
    const p = new URLSearchParams(h);
    const obj = {};
    for (const [k, v] of p.entries()) obj[k] = v;
    return obj;
  }

  // 1) Resolver callback (PKCE o Implicit), limpiar URL y fijar sesión
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const hasCode = url.searchParams.get("code");
        const hasHashAT = window.location.hash.includes("access_token");

        if (hasCode) {
          // PKCE
          await supabase.auth.exchangeCodeForSession(url.toString());
          window.history.replaceState({}, "", url.pathname);
        } else if (hasHashAT) {
          // Implicit/hash
          const hp = parseHashParams(window.location.hash);
          if (hp.access_token && hp.refresh_token) {
            await supabase.auth.setSession({
              access_token: hp.access_token,
              refresh_token: hp.refresh_token,
            });
          }
          window.history.replaceState({}, "", url.pathname);
        }
      } catch {
        // ignoramos si no aplica
      } finally {
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, sess) => {
          setSession(sess);
          if (event === "SIGNED_IN") navigate("/", { replace: true });
          if (event === "SIGNED_OUT") navigate("/login", { replace: true });
        });

        // Si la ruta actual no es conocida (ej. /auth/v1/callback), envía al landing
        if (!knownPaths.has(location.pathname) && !location.pathname.startsWith("/chats/")) {
          navigate("/", { replace: true });
        }

        setBooting(false);
        return () => subscription.unsubscribe();
      }
    })();
    // ⚠️ solo en primer render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (booting) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-gray-500">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* HEADER */}
      <Header session={session} onLogout={handleLogout} />

      {/* NAVBAR */}
      <nav className="p-4 bg-white border-b border-gray-200 flex gap-6 justify-center shadow-sm">
        <Link to="/" className={NavLinkClasses}>
          Inicio
        </Link>
        <Link to="/dashboard" className={NavLinkClasses}>
          Panel de Control
        </Link>

        {session && (
          <>
            <Link to="/perfil" className={NavLinkClasses}>
              Mi Perfil
            </Link>
            <Link to="/sugerencias" className={NavLinkClasses}>
              Sugerencias
            </Link>
            <Link to="/chats" className={NavLinkClasses}>
              Mis Chats
            </Link>
            <Link to="/eventos-exitosos" className={NavLinkClasses}>
              Eventos exitosos
            </Link>
            <Link to="/normas" className={NavLinkClasses}>
              Normas
            </Link>
          </>
        )}
      </nav>

      {/* CONTENIDO */}
      <main className="flex-grow">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginForm />} />

          {/* Protegidas */}
          <Route
            path="/dashboard"
            element={
              session ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/users"
            element={session ? <Users /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/users/:id"
            element={session ? <PerfilPublico /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/perfil"
            element={
              session ? (
                <PerfilUsuario session={session} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/sugerencias"
            element={
              session ? <Sugerencias /> : <Navigate to="/login" replace />
            }
          />

          {/* Chat */}
          <Route
            path="/chats"
            element={
              <RequireAuth>
                <Chats />
              </RequireAuth>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <RequireAuth>
                <ChatRoom />
              </RequireAuth>
            }
          />
          <Route
            path="/eventos-exitosos"
            element={session ? <EventosExitosos /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/normas"
            element={session ? <NormasPage /> : <Navigate to="/login" replace />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex-grow p-10 text-center">
                <h1 className="text-3xl font-bold text-red-600">
                  404 - Página No Encontrada
                </h1>
              </div>
            }
          />

          {/* ❌ Página No Encontrada */}
          <Route 
            path="*" 
            element={
              <div className="flex-grow p-10 text-center">
                <h1 className="text-3xl font-bold text-red-600">404 - Página No Encontrada</h1>
              </div>
            } 
          />

        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
