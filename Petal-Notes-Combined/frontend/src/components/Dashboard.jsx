import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import NoteCard from "./NoteCard.jsx";
import NoteModal from "./NoteModal.jsx";

const PIN_KEY = "petal_pins";
const loadPins = () => {
  try { return new Set(JSON.parse(localStorage.getItem(PIN_KEY) || "[]")); } catch { return new Set(); }
};

function burst(x, y) {
  const emojis = ["💖", "🌸", "✨", "💕", "🌷"];
  for (let i = 0; i < 16; i++) {
    const el = document.createElement("span");
    el.className = "confetti";
    el.textContent = emojis[i % emojis.length];
    const ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
    const dist = 70 + Math.random() * 110;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
    el.style.setProperty("--dy", `${Math.sin(ang) * dist - 40}px`);
    el.style.setProperty("--rot", `${Math.random() * 360 - 180}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

export default function Dashboard({ token, username, onLogout, toast }) {
  const [notes, setNotes] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | {} (new) | note
  const [pins, setPins] = useState(loadPins);
  const searchRef = useRef(null);
  const fabRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setNotes(await api.getNotes(token));
    } catch (e) {
      toast(e.message, "error");
      setNotes([]);
    }
  }, [token, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    localStorage.setItem(PIN_KEY, JSON.stringify([...pins]));
  }, [pins]);

  // keyboard shortcuts: "n" new note, "/" search
  useEffect(() => {
    const h = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (typing || modal || e.ctrlKey || e.metaKey) return;
      if (e.key === "n") { e.preventDefault(); setModal({}); }
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal]);

  const togglePin = (id) =>
    setPins((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  async function handleSave(title, content) {
    try {
      if (modal?._id) {
        const upd = await api.updateNote(token, modal._id, title, content);
        setNotes((ns) => ns.map((n) => (n._id === upd._id ? upd : n)));
        toast("Note updated 💕");
      } else {
        const created = await api.createNote(token, title, content);
        setNotes((ns) => [created, ...ns]);
        toast("Note saved! 🌸");
        const r = fabRef.current?.getBoundingClientRect();
        if (r) burst(r.left + r.width / 2, r.top + r.height / 2);
      }
    } catch (e) {
      toast(e.message, "error");
      throw e;
    }
  }

  async function handleDelete(note) {
    const prev = notes;
    setNotes((ns) => ns.filter((n) => n._id !== note._id)); // optimistic
    try {
      await api.deleteNote(token, note._id);
      toast("Note deleted 🍃");
    } catch (e) {
      setNotes(prev);
      toast(e.message, "error");
    }
  }

  const visible = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    let list = notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    if (filter === "pinned") list = list.filter((n) => pins.has(n._id));
    const by = {
      newest: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      az: (a, b) => a.title.localeCompare(b.title),
    }[sort];
    return [...list].sort((a, b) => (pins.has(b._id) - pins.has(a._id)) || by(a, b));
  }, [notes, query, sort, filter, pins]);

  const totalWords = (notes || []).reduce((s, n) => s + (n.content.trim() ? n.content.trim().split(/\s+/).length : 0), 0);
  const pinCount = (notes || []).filter((n) => pins.has(n._id)).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="dash">
      <nav className="topbar glass">
        <div className="brand"><span className="spin-slow">🌸</span> Petal <b>Notes</b></div>
        <div className="search">
          <span>🔍</span>
          <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…  ( / )" />
          {query && <button className="icon-btn" onClick={() => setQuery("")} aria-label="Clear search">✕</button>}
        </div>
        <div className="user">
          <div className="avatar">{username?.[0]?.toUpperCase() || "🌸"}</div>
          <span className="uname">{username}</span>
          <button className="btn ghost sm" onClick={onLogout}>Log out</button>
        </div>
      </nav>

      <main className="content">
        <section className="hello">
          <div>
            <h2>{greet}, <span className="grad">{username}</span> <span className="wave">👋</span></h2>
            <p className="muted">Here’s everything you’ve jotted down.</p>
          </div>
          <div className="stats">
            <div className="stat"><b>{notes?.length ?? "–"}</b><span>notes</span></div>
            <div className="stat"><b>{notes ? totalWords : "–"}</b><span>words</span></div>
            <div className="stat"><b>{notes ? pinCount : "–"}</b><span>pinned</span></div>
          </div>
        </section>

        <section className="toolbar">
          <div className="tabs">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
            <button className={filter === "pinned" ? "active" : ""} onClick={() => setFilter("pinned")}>📌 Pinned</button>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort notes">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A → Z</option>
          </select>
        </section>

        {notes === null ? (
          <div className="grid">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton" style={{ animationDelay: `${i * 90}ms` }} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">{notes.length === 0 ? "📝" : "🔎"}</div>
            <h3>{notes.length === 0 ? "Your garden is empty" : "Nothing found"}</h3>
            <p className="muted">
              {notes.length === 0 ? "Plant your first note and watch it bloom." : "Try a different search or filter."}
            </p>
            {notes.length === 0 && <button className="btn primary big" onClick={() => setModal({})}>＋ Write first note</button>}
          </div>
        ) : (
          <div className="grid">
            {visible.map((n, i) => (
              <NoteCard
                key={n._id}
                note={n}
                index={i}
                pinned={pins.has(n._id)}
                highlight={query.trim()}
                onPin={togglePin}
                onOpen={setModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <button ref={fabRef} className="fab" onClick={() => setModal({})} aria-label="New note" title="New note (n)">
        <span>＋</span>
      </button>

      {modal && (
        <NoteModal
          key={modal._id || "new"}
          note={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
