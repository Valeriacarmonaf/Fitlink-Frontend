import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

const SecondaryButtonClasses =
  "inline-block px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150";

/* ===== Helpers de normalización seguros ===== */
const toStr = (v) => (v ?? "").toString();
const norm = (s) => toStr(s).trim().toLowerCase();

/** Acepta categoría string u objeto, devuelve string seguro */
function catToString(cat) {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") {
    return toStr(cat.nombre || cat.Nombre || ""); 
  }
  return ""; 
}

/** * Helper CRÍTICO para obtener el nombre del evento.
 * Busca en varias propiedades por si Supabase devuelve mayúsculas/minúsculas distintas.
 */
function getEventName(e) {
  if (!e) return "";
  return e.nombre_evento || e.Nombre_evento || e.nombre || e.Name || "";
}

/** Helper para obtener propiedad (soporta minúscula o Capitalizada) */
const getProp = (obj, keyLower, keyCap) => obj[keyLower] || obj[keyCap];

/** Devuelve un URL de imagen según categoría */
function imageByCategory(cat) {
  const k = norm(catToString(cat));
  if (k.includes("yoga") || k.includes("mente")) {
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop";
  }
  if (k.includes("running") || k.includes("caminata")) {
    return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop";
  }
  if (k.includes("cicl")) {
    return "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";
  }
  if (k.includes("equipo") || k.includes("fut") || k.includes("balon")) {
    return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
}

export default function Dashboard() {
  // ----- estado -----
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ usuarios: 0, categorias: 0, eventosProximos: 0 });
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");

  // Modal de detalles
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const handleShowDetails = (ev) => { setSelected(ev); setOpen(true); };

  // ----- filtros desde URL -----
  const [searchParams] = useSearchParams();
  // Obtenemos 'q' (lo que escribes en el buscador)
  const q = norm(searchParams.get("q") || "");
  
  const cats = (searchParams.get("categorias") || "")
    .split(",")
    .map((s) => norm(s))
    .filter(Boolean);
  const places = (searchParams.get("lugares") || "")
    .split(",")
    .map((s) => norm(s))
    .filter(Boolean);

  // ¿Estamos en modo búsqueda?
  const hasSearch = Boolean(q || cats.length || places.length);

  // ----- carga inicial -----
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const [stats, upcoming] = await Promise.all([
          api?.stats ? api.stats(token) : Promise.resolve({ usuarios: 0, categorias: 0, eventosProximos: 0 }),
          api?.upcomingEvents ? api.upcomingEvents(100, token) : Promise.resolve([]),
        ]);

        setKpis(stats || { usuarios: 0, categorias: 0, eventosProximos: 0 });
        setEventos(upcoming || []);
      } catch (e) {
        console.error("Dashboard Load Error:", e);
        setError(e?.message || "Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ----- filtros locales MEJORADOS -----
  const eventosFiltrados = useMemo(() => {
    let arr = eventos || [];

    // Pre-procesamos para facilitar la búsqueda
    let normalizedEvents = arr.map(e => {
        const rawCat = getProp(e, 'categoria', 'Categoria'); 
        const rawMuni = getProp(e, 'municipio', 'Municipio');
        
        // AQUÍ ESTÁ LA CLAVE: Usamos el helper getEventName
        const rawName = getEventName(e); 
        const rawDesc = getProp(e, 'descripcion', 'Descripcion');

        return {
            original: e,
            catStr: norm(catToString(rawCat)),
            muniStr: norm(rawMuni),
            // Creamos un string de búsqueda que prioriza el nombre
            nameStr: norm(rawName), 
            // String compuesto para búsquedas generales
            fullSearchStr: norm(`${rawName} ${rawDesc} ${rawMuni}`)
        };
    });

    // 1. Filtro por Texto (Nombre)
    if (q) {
      console.log(`🔍 Buscando "${q}" en ${normalizedEvents.length} eventos...`);
      
      normalizedEvents = normalizedEvents.filter(item => {
         // Buscamos PRINCIPALMENTE en el nombre del evento
         const matchName = item.nameStr.includes(q);
         
         // Opcional: Si quieres que también busque en descripción o categoría, usa fullSearchStr
         // Por ahora, como pediste "buscar por nombre", damos prioridad a eso, 
         // pero es buena UX buscar en todo.
         const matchAll = item.fullSearchStr.includes(q) || item.catStr.includes(q);
         
         return matchAll; 
      });
      
      console.log(`✅ Encontrados: ${normalizedEvents.length}`);
    }

    // 2. Filtro por Categoría
    if (cats.length) {
      normalizedEvents = normalizedEvents.filter(item => 
        cats.includes(item.catStr)
      );
    }

    // 3. Filtro por Lugar
    if (places.length) {
      normalizedEvents = normalizedEvents.filter(item => 
        places.includes(item.muniStr)
      );
    }

    return normalizedEvents.map(item => item.original);
  }, [eventos, q, cats, places]);

  // ----- tops para dashboard (sin búsqueda) -----
  const topCategorias = useMemo(() => {
    const m = new Map();
    (eventos || []).forEach((e) => {
      const rawCat = getProp(e, 'categoria', 'Categoria');
      const key = catToString(rawCat) || "Sin categoría";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return [...m.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [eventos]);

  const topMunicipios = useMemo(() => {
    const m = new Map();
    (eventos || []).forEach((e) => {
      const muni = getProp(e, 'municipio', 'Municipio');
      const key = muni || "Sin municipio";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return [...m.entries()]
      .map(([municipio, total]) => ({ municipio, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [eventos]);

  return (
    <main className="flex-grow p-6 sm:p-10 bg-white">
      <div className="max-w-6xl mx-auto">
        {!hasSearch && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">Panel de Control 📊</h1>
            <Link to="/" className={SecondaryButtonClasses}>Volver a Inicio</Link>
          </div>
        )}

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

        {!hasSearch && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <KPI title="Usuarios" value={kpis.usuarios} loading={loading} />
            <KPI title="Categorías" value={kpis.categorias} loading={loading} />
            <KPI title="Eventos próximos" value={kpis.eventosProximos} loading={loading} />
          </section>
        )}

        {!hasSearch && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <Card title="Top categorías por número de eventos">
              {loading ? <SkeletonRows /> : (
                <SimpleList items={topCategorias} labelKey="categoria" valueKey="total" emptyText="Sin datos" />
              )}
            </Card>
            <Card title="Top municipios con más eventos">
              {loading ? <SkeletonRows /> : (
                <SimpleList items={topMunicipios} labelKey="municipio" valueKey="total" emptyText="Sin datos" />
              )}
            </Card>
          </section>
        )}

        {/* Resultados */}
        {loading ? (
          <Card title="Cargando…">
            <SkeletonRows />
          </Card>
        ) : hasSearch ? (
          <>
            <div className="text-lg font-semibold mb-3">
              Resultados para "{q}" ({eventosFiltrados.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosFiltrados.map((e) => {
                const rawCat = getProp(e, 'categoria', 'Categoria');
                return (
                    <EventReal
                    key={e.id || e.ID}
                    event={{
                        ...e,
                        imageUrl: e.imageUrl || imageByCategory(rawCat),
                        categoria: catToString(rawCat),
                    }}
                    onShowDetails={handleShowDetails}
                    />
                );
              })}
              {eventosFiltrados.length === 0 && (
                <div className="text-gray-500 col-span-full text-center py-10 border rounded-lg bg-gray-50">
                    <p className="font-bold mb-2">No se encontraron eventos con "{q}".</p>
                    <p className="text-sm">Prueba buscando por otra palabra clave o revisa los filtros aplicados.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <Card title={`Próximos eventos (${Math.min(8, eventos.length)})`}>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Evento</Th>
                    <Th>Categoría</Th>
                    <Th>Municipio</Th>
                    <Th className="text-right">Precio</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.slice(0, 8).map((e) => {
                    const inicio = getProp(e, 'inicio', 'Inicio');
                    const nombre = getEventName(e); // Usamos el helper seguro
                    const rawCat = getProp(e, 'categoria', 'Categoria');
                    const muni = getProp(e, 'municipio', 'Municipio');
                    const precio = getProp(e, 'precio', 'Precio');
                    const estado = getProp(e, 'estado', 'Estado');

                    return (
                        <tr key={e.id || e.ID} className="border-t">
                        <Td>{inicio ? new Date(inicio).toLocaleString() : "-"}</Td>
                        <Td className="font-medium text-indigo-600">{nombre}</Td>
                        <Td>{catToString(rawCat) || "-"}</Td>
                        <Td>{muni || "-"}</Td>
                        <Td className="text-right">
                            {precio != null && !Number.isNaN(Number(precio))
                            ? Number(precio).toFixed(2)
                            : "-"}
                        </Td>
                        <Td>
                             <span className={`px-2 py-1 rounded text-xs ${
                                norm(estado) === "activo" ? "bg-green-100 text-green-700"
                                : norm(estado) === "finalizado" ? "bg-gray-100 text-gray-700"
                                : norm(estado) === "cancelado" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {estado || "pendiente"}
                            </span>
                        </Td>
                        </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <EventDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        event={selected}
      />
    </main>
  );
}

/* ---------- UI helpers ---------- */
function KPI({ title, value, loading }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm bg-white">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-3xl font-bold mt-1">{loading ? "…" : value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm bg-white">
      <div className="text-lg font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

function SimpleList({ items, labelKey, valueKey, emptyText }) {
  if (!items || items.length === 0) return <div className="text-gray-500">{emptyText}</div>;
  return (
    <ul className="divide-y">
      {items.map((it, idx) => (
        <li key={idx} className="py-2 flex items-center justify-between">
          <span className="truncate">{it[labelKey]}</span>
          <span className="font-semibold">{it[valueKey]}</span>
        </li>
      ))}
    </ul>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-3 py-2 border text-left ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function SkeletonRows() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded" />
      <div className="h-4 bg-gray-100 rounded" />
      <div className="h-4 bg-gray-100 rounded" />
    </div>
  );
}