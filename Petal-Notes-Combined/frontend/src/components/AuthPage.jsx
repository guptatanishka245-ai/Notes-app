import { useState } from "react";
import { api } from "../api.js";

export default function AuthPage({ onAuth, toast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isLogin = mode === "login";

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) {
        const d = await api.login(form.email.trim(), form.password);
        onAuth(d.token, d.username);
      } else {
        await api.register(form.username.trim(), form.email.trim(), form.password);
        toast("Account created! Please log in 💕");
        setMode("login");
        setForm({ ...form, username: "", password: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-hero">
        <div className="logo-bounce">🌸</div>
        <h1>
          Petal <span>Notes</span>
        </h1>
        <p>A soft, pretty place for your thoughts, plans and little ideas.</p>
        <ul className="feature-list">
          <li><span>✨</span> Capture notes in a snap</li>
          <li><span>📌</span> Pin your favourites</li>
          <li><span>🔍</span> Search everything instantly</li>
          <li><span>🔒</span> Private to your account</li>
        </ul>
      </section>

      <section className="auth-card glass">
        <div className={`seg ${isLogin ? "left" : "right"}`}>
          <i className="seg-thumb" />
          <button type="button" onClick={() => { setMode("login"); setError(""); }}>Log in</button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }}>Sign up</button>
        </div>

        <h2>{isLogin ? "Welcome back 💗" : "Join the garden 🌷"}</h2>
        <p className="muted">{isLogin ? "Log in to see your notes." : "Create an account in a few seconds."}</p>

        <form onSubmit={submit} key={mode} className="form-anim">
          {!isLogin && (
            <label className="field">
              <span>Username</span>
              <input value={form.username} onChange={set("username")} placeholder="cutiepie" required minLength={2} autoComplete="username" />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="pw">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                required
                minLength={isLogin ? 1 : 6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {!isLogin && form.password && (
            <div className="strength" aria-label="Password strength">
              {[1, 2, 3, 4].map((n) => (
                <i key={n} className={n <= strength ? `on s${strength}` : ""} />
              ))}
              <small>{["", "Weak", "Okay", "Good", "Strong"][strength]}</small>
            </div>
          )}

          {error && <div className="form-error shake">🥀 {error}</div>}

          <button className="btn primary big" disabled={busy}>
            {busy ? <span className="spinner" /> : isLogin ? "Log in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
