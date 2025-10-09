// src/components/EventReal.jsx
import React from "react";

const FALLBACK_IMG = "/vite.svg"; // o crea /public/images/placeholder.jpg y usa esa ruta

export default function EventReal({ event, onShowDetails }) {
  // Soporta formato de BD y el legacy
  const title = event?.nombre_evento ?? event?.title ?? "Evento";
  const desc = event?.descripcion ?? event?.description ?? "";
  const zona = event?.municipio ?? event?.zona ?? "";
  const imgSrc = event?.imageUrl || FALLBACK_IMG;

  const handleClick = () => {
    if (!onShowDetails) return;
    onShowDetails({
      id: event?.id,
      nombre_evento: title,
      descripcion: desc,
      municipio: zona,
      categoria: event?.categoria ?? "",
      inicio: event?.inicio ?? null,
      fin: event?.fin ?? null,
      cupos: event?.cupos ?? null,
      precio: event?.precio ?? null,
      estado: event?.estado ?? "Activo",
      imageUrl: imgSrc,
      creador_id: event?.creador_id ?? null,
    });
  };

  return (
    // 👇 Anchos responsive para 1/2/3 tarjetas visibles
    <div className="flex-none shrink-0 basis-[85%] sm:basis-[48%] lg:basis-[32%] rounded-lg shadow-lg overflow-hidden bg-white m-4 border border-gray-200 transition-transform hover:scale-[1.02]">
      <img
        className="w-full h-40 object-cover bg-gray-100"
        src={imgSrc}
        alt={title}
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMG;
        }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{title}</h3>
          {zona && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
              {zona}
            </span>
          )}
        </div>

        {desc && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{desc}</p>}

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition duration-200"
          onClick={handleClick}
          aria-label="Ver detalles del evento"
        >
          Ver Evento
        </button>
      </div>
    </div>
  );
}
