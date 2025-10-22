// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EventReal from "../components/EventReal";
import EventDetailsModal from "../components/EventDetailsModal";
import { api } from "../lib/api"; // ajusta si tu módulo exporta distinto

const SecondaryButtonClasses =
  "inline-block px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150";

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
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const cats = (searchParams.get("categorias") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const places = (searchParams.get("lugares") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // ¿Estamos en modo búsqueda?
  const hasSearch = Boolean(q || cats.length || places.length);

  // ----- carga inicial -----
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);

        // Trae KPIs y próximos eventos
        const [stats, upcoming] = await Promise.all([
          api?.stats ? api.stats() : Promise.resolve({ usuarios: 0, categorias: 0, eventosProximos: 0 }),
          api?.upcomingEvents ? api.upcomingEvents(100) : Promise.resolve([]),
        ]);

        setKpis(stats || { usuarios: 0, categorias: 0, eventosProximos: 0 });
        setEventos(upcoming || []);
      } catch (e) {
        setError(e?.message || "Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ----- filtros locales -----
  const norm = (s) => (s || "").toString().trim().toLowerCase();

  const eventosFiltrados = useMemo(() => {
    let arr = eventos;

    if (q) {
      arr = arr.filter((e) =>
        [e.nombre_evento, e.descripcion, e.categoria, e.municipio]
          .map(norm)
          .some((v) => v.includes(q))
      );
    }
    if (cats.length) {
      arr = arr.filter((e) => cats.includes(norm(e.categoria)));
    }
    if (places.length) {
      arr = arr.filter((e) => places.includes(norm(e.municipio)));
    }
    return arr;
  }, [eventos, q, cats, places]);

  // ----- tops para dashboard (sin búsqueda) -----
  const topCategorias = useMemo(() => {
    const m = new Map();
    (eventos || []).forEach((e) => {
      const key = e.categoria || "Sin categoría";
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
      const key = e.municipio || "Sin municipio";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return [...m.entries()]
      .map(([municipio, total]) => ({ municipio, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [eventos]);

  // Imagen placeholder por categoría (ajústalo o bórralo si ya guardas imageUrl)
  const imageByCategory = (cat) => {
    const k = (cat || "").toLowerCase();
    if (k.includes("yoga") || k.includes("mente")) return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("running") || k.includes("caminata")) return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("cicl")) return "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("equipo")) return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
  };

  return (
    <main className="flex-grow bg-white-50 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado + botón: solo si NO hay búsqueda */}
        {!hasSearch && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">Panel de Control 📊</h1>
            <Link to="/" className={SecondaryButtonClasses}>Volver a Inicio</Link>
          </div>
        )}

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

        {/* KPIs: solo si NO hay búsqueda */}
        {!hasSearch && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <KPI title="Usuarios" value={kpis.usuarios} loading={loading} />
            <KPI title="Categorías" value={kpis.categorias} loading={loading} />
            <KPI title="Eventos próximos" value={kpis.eventosProximos} loading={loading} />
          </section>
        )}

        {/* Tops: solo si NO hay búsqueda */}
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
          // ======= MODO BÚSQUEDA: SOLO RESULTADOS =======
          <>
            <div className="text-lg font-semibold mb-3">
              Resultados ({eventosFiltrados.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosFiltrados.map((e) => (
                <EventReal
                  key={e.id}
                  event={{
                    ...e,
                    // asegúrate de que EventReal tenga una imagen
                    imageUrl: e.imageUrl || imageByCategory(e.categoria),
                  }}
                  onShowDetails={handleShowDetails}
                />
              ))}
              {eventosFiltrados.length === 0 && (
                <div className="text-gray-500">No hay resultados para tu búsqueda.</div>
              )}
            </div>
          </>
        ) : (
          // ======= DASHBOARD NORMAL =======
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
                  {eventos.slice(0, 8).map((e) => (
                    <tr key={e.id} className="border-t">
                      <Td>{e.inicio ? new Date(e.inicio).toLocaleString() : "-"}</Td>
                      <Td className="font-medium">{e.nombre_evento}</Td>
                      <Td>{e.categoria}</Td>
                      <Td>{e.municipio || "-"}</Td>
                      <Td className="text-right">{e.precio != null ? Number(e.precio).toFixed(2) : "-"}</Td>
                      <Td>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            (e.estado || "").toLowerCase() === "activo"
                              ? "bg-green-100 text-green-700"
                              : (e.estado || "").toLowerCase() === "finalizado"
                              ? "bg-gray-100 text-gray-700"
                              : (e.estado || "").toLowerCase() === "cancelado"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {e.estado || "pendiente"}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal único reutilizable (carrete y búsqueda) */}
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
