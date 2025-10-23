import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { chatApi } from "../lib/api";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatRoom() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const scroller = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatApi.listMessages(chatId);
      setMsgs(data);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        if (scroller.current) {
          scroller.current.scrollTop = scroller.current.scrollHeight;
        }
      });
    }
  }, [chatId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const m = await chatApi.sendMessage(chatId, text.trim());
    setMsgs(prev => [...prev, m]);
    setText("");
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* header */}
      <div className="h-14 px-2 flex items-center gap-2 border-b">
        <button onClick={() => navigate(-1)} className="p-2"><ArrowLeft/></button>
        <div className="font-medium">Chat</div>
      </div>

      {/* mensajes */}
      <div ref={scroller} className="flex-1 overflow-auto bg-gray-50 p-3 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500 text-sm py-4">Cargando…</div>
        ) : msgs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">Aún no hay mensajes</div>
        ) : (
          msgs.map(m => (
            <Bubble key={m.id} mine={m.user?.id === window.localStorage.getItem("uid") /* opcional */} msg={m}/>
          ))
        )}
      </div>

      {/* input */}
      <form onSubmit={onSend} className="border-t p-2 flex items-center gap-2 bg-white">
        <input
          className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
          placeholder="Escribe un mensaje"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-50"
                disabled={!text.trim()}>
          <Send size={18}/>
        </button>
      </form>
    </div>
  );
}

function Bubble({ mine, msg }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm
        ${mine ? "bg-blue-600 text-white" : "bg-white border"}`}>
        {!mine && <div className="text-[11px] text-gray-500 mb-0.5">{msg.user?.nombre || "Usuario"}</div>}
        <div>{msg.content}</div>
        <div className={`mt-1 text-[10px] ${mine ? "text-blue-100" : "text-gray-400"}`}>
          {new Date(msg.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
        </div>
      </div>
    </div>
  );
}