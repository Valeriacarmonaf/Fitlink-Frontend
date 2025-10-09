import React from 'react';

const EventReal = ({ event, onShowDetails }) => {
  const { title, description, zona, imageUrl } = event;

  return (
    // w-80 (320px) + m-4 (32px) = 352px total (coincide con el carrusel)
    <div className="flex-none w-80 max-w-sm rounded-lg shadow-lg overflow-hidden bg-white m-4 border border-gray-200">
      <img
        className="w-full h-40 object-cover"
        src={imageUrl}
        alt={title}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          {zona && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
              {zona}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mt-2">{description}</p>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition duration-200"
          onClick={() => onShowDetails(event)} 
          aria-label="Ver detalles del evento"
        >
          Ver Evento
        </button>
      </div>
    </div>
  );
};

export default EventReal;
