// components/FiltersModal.jsx
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const CATEGORIES = [
  "🏃 Running y Caminata",
  "⚽ Deportes de equipo",
  "🧘 Bienestar y mente-cuerpo",
  "🚴 Ciclismo",
  "🏋️ Fitness y entrenamiento",
  "🤾 Deportes de raqueta y precisión",
  "🏊 Acuáticos",
  "🧗 Aventura y aire libre",
  "🚶 Recreativos y sociales",
  "🥋 Artes marciales y defensa personal",
  "🏇 Deportes especiales o de nicho",
];

// Municipios del Área Metropolitana de Caracas
const PLACES = [
  "Libertador",
  "Chacao",
  "Baruta",
  "Sucre",
  "El Hatillo",
];

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-4 py-2 rounded-full text-sm border transition text-left",
        "focus:outline-none focus:ring-2 focus:ring-[#6BA8FF]/40",
        selected
          ? "bg-[#6BA8FF] text-white border-transparent"
          : "bg-white text-slate-700 border-blue-200 hover:bg-[#6BA8FF]/10"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function FiltersModal({ open, onClose, onApply }) {
  const dialogRef = useRef(null);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const toggleCategory = (label) =>
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const togglePlace = (label) =>
    setSelectedPlaces((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  const clearAll = () => {
    setSelectedCategories(new Set());
    setSelectedPlaces(new Set());
  };

  const apply = () => {
    onApply?.({
      categories: [...selectedCategories],
      lugares: [...selectedPlaces],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="filters-title">
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Panel: centrado, con altura máxima y scroll interno en el body */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl mx-auto bg-white text-slate-800 rounded-2xl shadow-2xl border border-blue-100
                   max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 flex-shrink-0">
          <h2 id="filters-title" className="text-xl font-semibold text-slate-800">Filtros de búsqueda</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#6BA8FF]/40"
            aria-label="Cerrar filtros"
          >
            <X />
          </button>
        </div>

        {/* Body: con scroll interno */}
        <div className="px-6 py-5 grid gap-8 md:grid-cols-2 overflow-auto">
          {/* 1) Categorías */}
          <section>
            <h3 className="uppercase tracking-wide text-sm text-slate-600 mb-3">
              Categorías
            </h3>
            <div className="flex flex-col gap-2 max-w-md">
              {CATEGORIES.map((label) => (
                <Chip
                  key={label}
                  selected={selectedCategories.has(label)}
                  onClick={() => toggleCategory(label)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </section>

          {/* 2) Lugares (Municipios de Caracas) */}
          <section>
            <h3 className="uppercase tracking-wide text-sm text-slate-600 mb-3">
              Lugares
            </h3>
            <div className="flex flex-col gap-2 max-w-md">
              {PLACES.map((label) => (
                <Chip
                  key={label}
                  selected={selectedPlaces.has(label)}
                  onClick={() => togglePlace(label)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </section>
        </div>

        {/* Footer: fijo (sin verse afectado por el scroll interno) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0 bg-white">
          <button
            onClick={clearAll}
            type="button"
            className="text-[#6BA8FF] hover:underline underline-offset-4 hover:bg-[#6BA8FF]/10 px-3 py-1 rounded-full transition"
          >
            Limpiar filtros
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-full border border-blue-200 text-slate-700 hover:bg-[#6BA8FF]/10 transition"
            >
              Cancelar
            </button>
            <button
              onClick={apply}
              type="button"
              className="px-4 py-2 rounded-full bg-[#6BA8FF] text-white font-semibold hover:bg-sky-500 transition"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
