import React from 'react';

export default function NormasPage() {
  const normas = [
    'Respeto mutuo – Evita agresiones, insultos y cualquier forma de hostilidad.',
    'Cero discriminación – No se permiten comentarios discriminatorios de ningún tipo.',
    'Puntualidad en los entrenamientos – Respeta los horarios acordados con otros usuarios.',
    'Honestidad en tu perfil – Mantén información real sobre tus objetivos y habilidades.',
    'Conducta segura – Entrena cuidando tu seguridad y la de los demás.',
    'Comunicación responsable – Mantén un tono cordial y evita spam o mensajes no deseados.',
    'Cuidado de los espacios – Respeta instalaciones, parques, gimnasios y lugares públicos.',
    'Respeto a los límites personales – Evita solicitudes o comentarios inapropiados.',
    'Uso correcto de reportes – Reporta comportamientos inapropiados con responsabilidad.',
    'Promover el bienestar común – Aporta a que FitLink sea una comunidad positiva y colaborativa.'
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Normas de la Comunidad FitLink</h1>

        <div className="space-y-6">
          {normas.map((texto, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">{idx + 1}</div>
              <div className="text-gray-700 text-lg">{texto}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
