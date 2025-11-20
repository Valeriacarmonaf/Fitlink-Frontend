// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import { supabase } from "./lib/supabase.js";

import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Users from "./pages/Users";
import PerfilUsuario from "./pages/PerfilUsuario";
import PerfilPublico from "./pages/PerfilPublico";
import LoginForm from "./pages/Login";
import Sugerencias from "./pages/Sugerencias";
import Notificaciones from "./pages/Notificaciones";

const NavLinkClasses =
  "px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150";

// Pasar parámetro dinámico
function PerfilPublicoWrapper() {
  const { id } = useParams();
  return <PerfilPublico userId={id} />;
}

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // -----------------------------
  // 🔥 Sincronizar sesión inicial
  // -----------------------------
  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.access_token) {
        localStorage.setItem("sb-access-token", data.session.access_token);
      }
    }
    loadSession();

    // ----------------------------------------------------------
    // 🔥 Mantener sesión cuando cambie: LOGIN, LOGOUT, REFRESH
    // ----------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // Guardar tokens en localStorage
      if (session?.access_token) {
        localStorage.setItem("sb-access-token", session.access_token);
      }
      if (session?.refresh_token) {
        localStorage.setItem("sb-refresh-token", session.refresh_token);
      }

      // Si el usuario cierra sesión
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("sb-access-token");
        localStorage.removeItem("sb-refresh-token");
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // -----------------------------
  // CERRAR SESIÓN
  //-----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
        <Link to="/notificaciones" className={NavLinkClasses}>
          Notificaciones
        </Link>

        {session && (
          <>
            <Link to="/perfil" className={NavLinkClasses}>
              Mi Perfil
            </Link>
            <Link to="/sugerencias" className={NavLinkClasses}>
              Sugerencias
            </Link>
          </>
        )}
      </nav>

      {/* CONTENIDO */}
      <main className="flex-grow">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginForm />} />

          {/* PERFIL PUBLICO */}
          <Route path="/perfil-publico/:id" element={<PerfilPublicoWrapper />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/users"
            element={session ? <Users /> : <Navigate to="/login" replace />}
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
              session ? <Sugerencias session={session} /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/notificaciones"
            element={
              session ? (
                <Notificaciones session={session} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
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
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

// Wrapper final
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
