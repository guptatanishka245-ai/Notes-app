import { useRef, useState } from "react";

const TINTS = ["#fff0f5", "#ffe8f1", "#fff5f8", "#ffeaf3", "#fdeef4", "#fff1f6"];
const tintFor = (id) => TINTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

function ago(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function NoteCard({ note, index, pinned, onPin, onOpen, onDelete, highlight }) {
  const ref = useRef(null);
  const [confirm, setConfirm] = useState(false);

  // 3D tilt + moving shine following the pointer
  const move = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const leave = () => {
    const el = ref.current;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const mark = (text) => {
    if (!highlight) return text;
    const i = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark>{text.slice(i, i + highlight.length)}</mark>
        {text.slice(i + highlight.length)}
      </>
    );
  };

  const edited = note.updatedAt && note.updatedAt !== note.createdAt;

  return (
    <article
      ref={ref}
      className={`note ${pinned ? "pinned" : ""}`}
      style={{ "--tint": tintFor(note._id), animationDelay: `${Math.min(index, 12) * 55}ms` }}
      onPointerMove={move}
      onPointerLeave={() => { leave(); setConfirm(false); }}
      onClick={() => onOpen(note)}
    >
      <div className="shine" />
      <div className="note-top">
        <h4>{mark(note.title)}</h4>
        <button
          className={`pin ${pinned ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); onPin(note._id); }}
          aria-label={pinned ? "Unpin" : "Pin"}
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? "📌" : "📍"}
        </button>
      </div>
      <p>{mark(note.content.length > 220 ? note.content.slice(0, 220) + "…" : note.content)}</p>
      <div className="note-bottom" onClick={(e) => e.stopPropagation()}>
        <span className="muted small">{edited ? "Edited " : ""}{ago(note.updatedAt || note.createdAt)}</span>
        {confirm ? (
          <div className="confirm">
            <button className="chip danger" onClick={() => onDelete(note)}>Delete?</button>
            <button className="chip" onClick={() => setConfirm(false)}>No</button>
          </div>
        ) : (
          <button className="icon-btn trash" onClick={() => setConfirm(true)} aria-label="Delete note">🗑️</button>
        )}
      </div>
    </article>
  );
}
