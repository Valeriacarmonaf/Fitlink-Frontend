// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const SecondaryButtonClasses =
  "inline-block px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ usuarios: 0, categorias: 0, eventosProximos: 0 });
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");

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

  const topCategorias = useMemo(() => {
    const m = new Map();
    eventos.forEach((e) => {
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
    eventos.forEach((e) => {
      const key = e.municipio || "Sin municipio";
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">Panel de Control 📊</h1>
          <Link to="/" className={SecondaryButtonClasses}>Volver a Inicio</Link>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <KPI title="Usuarios" value={kpis.usuarios} loading={loading} />
          <KPI title="Categorías" value={kpis.categorias} loading={loading} />
          <KPI title="Eventos próximos" value={kpis.eventosProximos} loading={loading} />
        </section>

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

        <Card title="Próximos eventos (8)">
          {loading ? <SkeletonRows /> : (
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
                      <Td>{new Date(e.inicio).toLocaleString()}</Td>
                      <Td className="font-medium">{e.nombre_evento}</Td>
                      <Td>{e.categoria}</Td>
                      <Td>{e.municipio || "-"}</Td>
                      <Td className="text-right">{Number(e.precio || 0).toFixed(2)}</Td>
                      <Td>
                        <span className={`px-2 py-1 rounded text-xs ${
                          e.estado === "activo" ? "bg-green-100 text-green-700" :
                          e.estado === "finalizado" ? "bg-gray-100 text-gray-700" :
                          e.estado === "cancelado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {e.estado}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

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
