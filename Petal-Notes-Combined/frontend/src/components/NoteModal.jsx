import { useEffect, useRef, useState } from "react";

const wc = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function NoteModal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const titleRef = useRef(null);
  const isNew = !note?._id;
  const dirty = title !== (note?.title || "") || content !== (note?.content || "");

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  async function save() {
    if (!title.trim() || !content.trim() || busy) return;
    setBusy(true);
    try {
      await onSave(title.trim(), content.trim());
      close();
    } catch {
      setBusy(false);
    }
  }

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") close();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") save();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  return (
    <div className={`overlay ${closing ? "out" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="modal glass" role="dialog" aria-modal="true">
        <header>
          <h3>{isNew ? "✨ New note" : "✏️ Edit note"}</h3>
          <button className="icon-btn" onClick={close} aria-label="Close">✕</button>
        </header>
        <input
          ref={titleRef}
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give it a lovely title…"
          maxLength={80}
        />
        <textarea
          className="content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something sweet…"
        />
        <footer>
          <span className="muted small">
            {wc(content)} words · {content.length} chars · <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to save
          </span>
          <div className="row">
            <button className="btn ghost" onClick={close}>Cancel</button>
            <button className="btn primary" onClick={save} disabled={busy || !title.trim() || !content.trim() || (!isNew && !dirty)}>
              {busy ? <span className="spinner" /> : isNew ? "Save note" : "Save changes"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
