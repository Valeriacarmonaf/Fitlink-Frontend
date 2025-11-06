// src/pages/ChatRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getMessages, sendMessage } from "../lib/chatApi";

export default function ChatRoom() {
  const { chatId } = useParams(); // Debe coincidir con la ruta: /chats/:chatId
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const bottomRef = useRef(null);

  // Carga mensajes
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!chatId) return;
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) {
          if (alive) setErr("Debes iniciar sesión.");
          return;
        }
        const items = await getMessages(chatId, { accessToken: token, limit: 50 });
        if (alive) {
          setMessages(items ?? []);
          // scroll al fondo
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 0);
        }
      } catch (e) {
        console.error(e);
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [chatId]);

  async function handleSend(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) {
        setErr("Debes iniciar sesión.");
        return;
      }
      const msg = await sendMessage(chatId, content, token);
      setMessages((prev) => [...prev, msg]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    } catch (e) {
      console.error(e);
      setErr(`Error al enviar: ${e.message}`);
    }
  }

  if (loading) return <div className="p-4">Cargando…</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4">
      {err && (
        <div className="mb-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          {err}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="p-2 rounded-lg bg-gray-100">
            <div className="text-xs opacity-60">
              {m.user?.nombre ?? "Usuario"} —{" "}
              {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
            </div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Escribe un mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="px-4 py-2 rounded-lg bg-black text-white">
          Enviar
        </button>
      </form>
    </div>
  );
}
