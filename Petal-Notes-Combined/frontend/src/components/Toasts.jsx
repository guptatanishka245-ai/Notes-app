export default function Toasts({ toasts }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-ico">{t.type === "error" ? "🥀" : "🌸"}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
