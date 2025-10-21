import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js'; 
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";
import LandingPage from "./pages/LandingPage"; 
import Dashboard from "./pages/Dashboard"; 
import Register from "./pages/Register";
import Users from "./pages/Users";
import PerfilUsuario from "./pages/PerfilUsuario";
import LoginForm from './pages/Login';

const NavLinkClasses = "px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150";

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Intenta obtener la sesión la primera vez que carga la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escucha cualquier cambio en el estado de autenticación (LOGIN, LOGOUT, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
      if (_event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    // Limpia el listener cuando el componente se desmonte
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Esta función ahora se pasará al Header
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 1. Pasar session y handleLogout como props al Header */}
      <Header session={session} onLogout={handleLogout} />

      {/* 2. NAVEGACIÓN SECUNDARIA (SIN BOTONES DE AUTENTICACIÓN) */}
      <nav className="p-4 bg-white border-b border-gray-200 flex gap-6 justify-center shadow-sm">
        <Link to="/" className={NavLinkClasses}>
          Inicio
        </Link>
        <Link to="/dashboard" className={NavLinkClasses}>
          Panel de Control
        </Link>
        
        {/* Solo mostrar "Mi Perfil" si el usuario ha iniciado sesión */}
        {session && (
          <Link to="/perfil" className={NavLinkClasses}>
            Mi Perfil
          </Link>
        )}
      </nav>

      {/* El resto de tu lógica de rutas no necesita cambios */}
      <main className="flex-grow">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginForm />} />
          
          {/* Rutas Protegidas */}
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
          
          {/* Ruta 404 */}
          <Route path="*" element={<div className="flex-grow p-10 text-center">
            <h1 className="text-3xl font-bold text-red-600">404 - Página No Encontrada</h1>
          </div>} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// Envuelve App con el Router para que el hook useNavigate funcione correctamente
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}