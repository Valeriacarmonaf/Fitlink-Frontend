import React from 'react';

const EventReal = ({ title, description, imageUrl }) => {
  return (
    // CRUCIAL: w-80 (320px) + m-4 (16px left + 16px right = 32px) = 352px total width
    <div className="flex-none w-80 max-w-sm rounded-lg shadow-lg overflow-hidden bg-white m-4 border border-gray-200">
      <img 
        className="w-full h-40 object-cover" 
        src={imageUrl} 
        alt={title} 
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition duration-200">
          Ver Evento
        </button>
      </div>
    </div>
  );
};

export default EventReal;