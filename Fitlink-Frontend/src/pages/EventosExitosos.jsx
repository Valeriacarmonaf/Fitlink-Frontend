// src/pages/EventosExitosos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";

/** FALLBACK: lista fija de municipios si aún no hay eventos */
const MUNICIPIOS_FIJO = [
  "Libertador", "Chacao", "Baruta", "Sucre", "El Hatillo",
  "Caracas", ]

const SecondaryButton =
  "inline-block px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition";
const PrimaryButton =
  "inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition";
const Input =
  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";
const Textarea =
  "w-full border border-gray-300 rounded-lg px-3 py-2 h-28 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400";

function formatDateToMMDDYYYY(value) {
  // value viene de <input type="date"> en formato yyyy-mm-dd
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${m}/${d}/${y}`;
}

function GalleryModal({ open, onClose, images = [], titulo }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{titulo || "Fotos del evento"}</h3>
          <button onClick={onClose} className={SecondaryButton}>Cerrar</button>
        </div>
        {images.length === 0 ? (
          <p className="text-gray-600">Este evento no tiene fotos.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((src, i) => (
              <img key={i} src={src} alt={`foto-${i}`} className="w-full h-40 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventosExitosos() {
  const [session, setSession] = useState(null);
  const [token, setToken] = useState("");

  // datos de la sección
  const [list, setList] = useState([]);
  const [cargaListado, setCargaListado] = useState(true);
  const [errorListado, setErrorListado] = useState("");

  // form
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaIso, setFechaIso] = useState(""); // input type="date"
  const [municipio, setMunicipio] = useState("");
  const [files, setFiles] = useState([]);
  const [errorForm, setErrorForm] = useState("");

  // modal fotos
  const [openModal, setOpenModal] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalTitulo, setModalTitulo] = useState("");

  // obtener sesión supabase
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setToken(data.session?.access_token || "");
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setToken(s?.access_token || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // para dropdown de municipios: intento 1) de eventos; 2) fallback fijo
  const [eventos, setEventos] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        setErrorListado("");
        setCargaListado(true);
        // Trae lista de éxitos y eventos para llenar municipios
        const [exitos, evts] = await Promise.all([
          token ? api.successEventsList(token) : Promise.resolve([]),
          api.events({ limit: 500 }).catch(() => []),
        ]);
        setList(exitos || []);
        setEventos(evts || []);
      } catch (e) {
        // Si falla (por ejemplo tabla aún no creada), no rompemos la UI:
        console.error(e);
        setErrorListado("Esta sección se habilitará cuando existan publicaciones.");
        setList([]); // mostramos vacío
      } finally {
        setCargaListado(false);
      }
    };
    if (token) load();
  }, [token]);

  const municipiosOptions = useMemo(() => {
    const s = new Set((eventos || []).map(e => e.municipio).filter(Boolean));
    const derivados = Array.from(s).sort();
    return derivados.length ? derivados : MUNICIPIOS_FIJO;
  }, [eventos]);

  const onSelectFiles = (e) => setFiles(Array.from(e.target.files || []));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorForm("");
      if (!token) throw new Error("Debes iniciar sesión.");
      const fecha = formatDateToMMDDYYYY(fechaIso);
      if (!fecha) throw new Error("Selecciona una fecha válida.");
      if (!municipio) throw new Error("Selecciona un municipio.");
      const created = await api.successEventsCreate(
        { titulo, descripcion, fecha, municipio, files },
        token
      );
      // feedback amigable
      alert("¡Evento exitoso publicado!");
      // limpiar
      setTitulo(""); setDescripcion(""); setFechaIso(""); setMunicipio(""); setFiles([]);
      // recargar lista
      const ex = await api.successEventsList(token);
      setList(ex || []);
    } catch (e2) {
      console.error(e2);
      setErrorForm(e2?.message || "Error creando evento exitoso");
    }
  };

  const openGallery = (fotos, t) => {
    setModalFotos(fotos || []);
    setModalTitulo(t || "");
    setOpenModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* TÍTULO correcto */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Eventos exitosos</h1>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Comparte tu evento</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Título</label>
            <input className={Input} value={titulo} onChange={(e)=>setTitulo(e.target.value)} required minLength={3} maxLength={120} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Fecha</label>
            <input type="date" className={Input} value={fechaIso} onChange={(e)=>setFechaIso(e.target.value)} required />
            <p className="text-xs text-gray-500 mt-1">Se enviará como <b>mm/dd/yyyy</b>.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Municipio</label>
            <select className={Input} value={municipio} onChange={(e)=>setMunicipio(e.target.value)} required>
              <option value="" disabled>Selecciona</option>
              {municipiosOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Descripción</label>
            <textarea className={Textarea} value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Fotos (puedes seleccionar varias)</label>
            <input type="file" accept="image/*" multiple onChange={onSelectFiles} />
            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">{files.length} archivo(s) seleccionado(s)</div>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="submit" className={PrimaryButton}>Publicar</button>
          </div>
          {/* Mensaje de error limpio (no JSON feo) */}
          {errorForm && <div className="md:col-span-2 text-red-600 font-semibold">⚠️ {errorForm}</div>}
        </form>
      </div>

      {/* LISTA */}
      <div>
        <h2 className="text-lg font-bold mb-3">Experiencias publicadas</h2>
        {cargaListado ? (
          <p>Cargando…</p>
        ) : errorListado ? (
          <p className="text-gray-600">{errorListado}</p>
        ) : list.length === 0 ? (
          <p className="text-gray-600">Aún no hay publicaciones.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {list.map((ev) => {
              const thumb = (ev.fotos || [])[0];
              return (
                <div key={ev.id} className="bg-white rounded-xl shadow hover:shadow-md transition">
                  {thumb ? (
                    <img src={thumb} alt={ev.titulo} className="w-full h-44 object-cover rounded-t-xl" />
                  ) : (
                    <div className="w-full h-44 bg-gray-200 rounded-t-xl flex items-center justify-center text-gray-500">
                      Sin foto
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{ev.titulo}</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{ev.fecha}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ev.municipio}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{ev.descripcion}</p>
                    <button className="mt-3 text-sm text-indigo-700 underline" onClick={() => openGallery(ev.fotos, ev.titulo)}>
                      Ver fotos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GalleryModal open={openModal} onClose={()=>setOpenModal(false)} images={modalFotos} titulo={modalTitulo} />
    </div>
  );
}
