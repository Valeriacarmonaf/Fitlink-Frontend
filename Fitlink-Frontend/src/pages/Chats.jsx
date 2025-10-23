import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../lib/api";
import { Search, PlusSquare } from "lucide-react";

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await chatApi.listChats();
        setChats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = chats.filter(c =>
    (c.title || "").toLowerCase().includes(q.toLowerCase())
    || (c.last_message || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* header compacto */}
      <div className="h-14 px-4 flex items-center justify-between bg-white border-b">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-500"/>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar"
            className="text-sm outline-none"
          />
        </div>
        <button className="p-1.5 rounded-lg border" onClick={() => navigate("/users")}>
          <PlusSquare size={18}/>
        </button>
      </div>

      {/* lista */}
      <div className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No hay chats</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => (
              <li key={c.id} onClick={() => navigate(`/chats/${c.id}`)}
                  className="flex items-center gap-3 px-4 py-3 bg-white active:bg-gray-50">
                <img src={c.image_url || "/vite.svg"} className="h-10 w-10 rounded-full object-cover" alt="chat"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[15px] truncate">{c.title || "Conversación"}</h3>
                    {c.last_time && <span className="text-[11px] text-gray-400">
                      {new Date(c.last_time).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                    </span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{c.last_message || "Nuevo chat"}</p>
                </div>
                {c.unread > 0 && (
                  <span className="ml-2 text-xs bg-purple-600 text-white rounded-full h-5 min-w-5 px-1 grid place-items-center">
                    {c.unread}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* bottom nav simple (opcional) */}
      <nav className="h-14 border-t bg-white grid grid-cols-2 text-xs">
        <button onClick={() => navigate("/dashboard")} className="grid place-items-center">Home</button>
        <button className="grid place-items-center text-purple-600 font-medium">Chats</button>
      </nav>
    </div>
  );
}
