// src/pages/Chats.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000' // tu FastAPI

export default function Chats() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session?.session?.access_token
        if (!token) {
          console.warn("No token, redirigiendo al login")
          navigate("/login")
          return
        }

        // ✅ Fíjate en esta línea: ahora apunta a /api/chats
        const res = await fetch(`${API_BASE}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error(`Error al obtener chats: ${res.status}`)
        }

        const data = await res.json()
        if (mounted) setChats(Array.isArray(data) ? data : data?.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [navigate])

  if (loading) return <div className="p-4">Cargando chats…</div>

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">Mis chats</h1>
      {chats.length === 0 && <div>No tienes chats aún.</div>}
      {chats.map((c) => (
        <div
          key={c.chat_id || c.id}
          className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => navigate(`/chats/${c.chat_id || c.id}`)}
        >
          <div className="font-medium">
            {c.title || `Evento #${c.evento_id}`}
          </div>
          {c.inicio && (
            <div className="text-sm opacity-70">
              Inicio: {new Date(c.inicio).toLocaleString()}
            </div>
          )}
          {c.municipio && (
            <div className="text-sm opacity-70">Municipio: {c.municipio}</div>
          )}
        </div>
      ))}
    </div>
  )
}
