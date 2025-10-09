// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import EventReal from "../components/EventReal";

const SecondaryButtonClasses =
  "inline-block px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ usuarios: 0, categorias: 0, eventosProximos: 0 });
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");

  // 🔎 Lee filtros desde la URL
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

  // 👉 clave: saber si estamos en "modo búsqueda"
  const hasSearch = Boolean(q || cats.length || places.length);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);
        const [stats, upcoming] = await Promise.all([
          api.stats(),
          api.upcomingEvents(50),
        ]);
        setKpis(stats);
        setEventos(upcoming || []);
      } catch (e) {
        setError(e.message || "Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const norm = (s) => (s || "").toString().trim().toLowerCase();

  // 🧠 Filtrado local (texto + categoría + municipio)
  const eventosFiltrados = useMemo(() => {
    let arr = eventos;

    if (q) {
      arr = arr.filter((e) => {
        const hay = [e.nombre_evento, e.descripcion, e.categoria, e.municipio]
          .map(norm)
          .some((v) => v.includes(q));
        return hay;
      });
    }
    if (cats.length) {
      arr = arr.filter((e) => cats.includes(norm(e.categoria)));
    }
    if (places.length) {
      arr = arr.filter((e) => places.includes(norm(e.municipio)));
    }
    return arr;
  }, [eventos, q, cats, places]);

  // 📈 Tops (para dashboard normal)
  const topCategorias = useMemo(() => {
    const m = new Map();
    (eventosFiltrados || []).forEach((e) => {
      const key = e.categoria || "Sin categoría";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return [...m.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [eventosFiltrados]);

  const topMunicipios = useMemo(() => {
    const m = new Map();
    (eventosFiltrados || []).forEach((e) => {
      const key = e.municipio || "Sin municipio";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return [...m.entries()]
      .map(([municipio, total]) => ({ municipio, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [eventosFiltrados]);

  // 🖼️ Imagen placeholder por categoría (opcional)
  const imageByCategory = (cat) => {
    const k = (cat || "").toLowerCase();
    if (k.includes("running") || k.includes("caminata"))
      return "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("equipo"))
      return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("mente"))
      return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("cicl"))
      return "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("fitness"))
      return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("raqueta") || k.includes("precisión"))
      return "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("acu"))
      return "https://images.unsplash.com/photo-1501611724492-c0653f39a7a1?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("aventura"))
      return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("recreativos"))
      return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
    if (k.includes("marciales"))
      return "https://images.unsplash.com/photo-1549055244-9f5c6ac91a04?q=80&w=1200&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1521417531039-94eaa7b5456f?q=80&w=1200&auto=format&fit=crop";
  };

  return (
    <main className="flex-grow p-6 sm:p-10 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* ▶️ Encabezado y botón: solo cuando NO hay búsqueda */}
        {!hasSearch && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">Panel de Control 📊</h1>
            <Link to="/" className={SecondaryButtonClasses}>Volver a Inicio</Link>
          </div>
        )}

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

        {/* ▶️ KPIs: solo cuando NO hay búsqueda */}
        {!hasSearch && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <KPI title="Usuarios" value={kpis.usuarios} loading={loading} />
            <KPI title="Categorías" value={kpis.categorias} loading={loading} />
            <KPI title="Eventos próximos" value={kpis.eventosProximos} loading={loading} />
          </section>
        )}

        {/* ▶️ Tops: solo cuando NO hay búsqueda */}
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

        {/* ▶️ Resultados */}
        {loading ? (
          <Card title="Cargando…">
            <SkeletonRows />
          </Card>
        ) : hasSearch ? (
          // 🔹 SOLO resultados (sin panel, sin KPIs, sin tops)
          <>
            <div className="text-lg font-semibold mb-3">
              Resultados ({eventosFiltrados.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosFiltrados.map((e) => (
                <EventReal
                  key={e.id}
                  event={{
                    // pasamos el objeto como lo espera tu tarjeta/modal
                    id: e.id,
                    nombre_evento: e.nombre_evento,
                    descripcion: e.descripcion,
                    municipio: e.municipio,
                    categoria: e.categoria,
                    inicio: e.inicio,
                    fin: e.fin,
                    cupos: e.cupos,
                    precio: e.precio,
                    estado: e.estado,
                    imageUrl: imageByCategory(e.categoria),
                  }}
                  onShowDetails={() => {}} // si usas modal aquí, pásalo desde el contenedor superior
                />
              ))}
              {eventosFiltrados.length === 0 && (
                <div className="text-gray-500">No hay resultados para tu búsqueda.</div>
              )}
            </div>
          </>
        ) : (
          // 🔹 Vista de dashboard (tabla cuando NO hay búsqueda)
          <Card title={`Próximos eventos (${Math.min(8, eventosFiltrados.length)})`}>
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
                  {eventosFiltrados.slice(0, 8).map((e) => (
                    <tr key={e.id} className="border-t">
                      <Td>{new Date(e.inicio).toLocaleString()}</Td>
                      <Td className="font-medium">{e.nombre_evento}</Td>
                      <Td>{e.categoria}</Td>
                      <Td>{e.municipio || "-"}</Td>
                      <Td className="text-right">{Number(e.precio || 0).toFixed(2)}</Td>
                      <Td>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            e.estado === "activo"
                              ? "bg-green-100 text-green-700"
                              : e.estado === "finalizado"
                              ? "bg-gray-100 text-gray-700"
                              : e.estado === "cancelado"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {e.estado}
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
