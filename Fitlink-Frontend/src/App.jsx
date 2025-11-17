import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  Navigate, 
  useParams 
} from 'react-router-dom';

import { supabase } from './lib/supabase.js'; 

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
import LoginForm from './pages/Login';
import Sugerencias from "./pages/Sugerencias";

const NavLinkClasses = 
  "px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150";

// ⭐ Wrapper para pasar el parámetro dinámico a PerfilPublico
function PerfilPublicoWrapper() {
  const { id } = useParams();
  return <PerfilPublico userId={id} />;
}

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Mantener sesión sincronizada con Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* HEADER */}
      <Header session={session} onLogout={handleLogout} />

      {/* NAVBAR */}
      <nav className="p-4 bg-white border-b border-gray-200 flex gap-6 justify-center shadow-sm">
        <Link to="/" className={NavLinkClasses}>Inicio</Link>
        <Link to="/dashboard" className={NavLinkClasses}>Panel de Control</Link>

        {session && (
          <>
            <Link to="/perfil" className={NavLinkClasses}>Mi Perfil</Link>
            <Link to="/sugerencias" className={NavLinkClasses}>Sugerencias</Link>
          </>
        )}
      </nav>

      {/* CONTENIDO */}
      <main className="flex-grow">
        <Routes>

          {/* 🌍 Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginForm />} />

          {/* ⭐ PERFIL PÚBLICO */}
          <Route path="/perfil-publico/:id" element={<PerfilPublicoWrapper />} />

          {/* 🔒 Rutas Protegidas */}
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
            element={session ? <PerfilUsuario session={session} /> : <Navigate to="/login" replace />} 
          />

          <Route 
            path="/sugerencias" 
            element={session ? <Sugerencias /> : <Navigate to="/login" replace />} 
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

// 🚀 Wrapper final con el Router
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
