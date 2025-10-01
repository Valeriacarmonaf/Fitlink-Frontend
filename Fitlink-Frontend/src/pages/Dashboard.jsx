import React from 'react';
import { Link } from 'react-router-dom';

const SecondaryButtonClasses = "inline-block px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150";

const Dashboard = () => {
  return (
    <main className="flex-grow p-10 bg-white">
      <div className="max-w-xl mx-auto py-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">¡Este es tu Panel de Control! 📊</h1>
        <p className="text-lg text-gray-600 mb-8">Aquí irá toda la lógica de usuario.</p>
        
        <Link to="/" className={SecondaryButtonClasses}>
            Volver a Inicio
        </Link>
      </div>
    </main>
  );
};

export default Dashboard;