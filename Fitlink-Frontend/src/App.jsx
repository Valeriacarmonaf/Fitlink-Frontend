import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

import LandingPage from "./pages/LandingPage"; 
import Dashboard from "./pages/Dashboard"; 

// Tailwind classes for the navigation links
const NavLinkClasses = "px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-150";

export default function App() {
  return (
    // The main container wrapper now uses a flex-column layout
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Navigation Bar with Tailwind */}
        <nav className="p-4 bg-white border-b border-gray-200 flex gap-6 justify-center shadow-sm">
          <Link to="/" className={NavLinkClasses}>
            Inicio
          </Link>
          <Link to="/dashboard" className={NavLinkClasses}>
            Panel de Control
          </Link>
        </nav>

        {/* Routes take up the rest of the vertical space (flex-grow) */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Replaced fl-main with Tailwind classes */}
          <Route path="*" element={<main className="flex-grow p-10 text-center">
            <h1 className="text-3xl font-bold text-red-600">404 - Página No Encontrada</h1>
          </main>} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}