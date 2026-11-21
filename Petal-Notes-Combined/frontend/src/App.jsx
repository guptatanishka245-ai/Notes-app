import { useCallback, useEffect, useState } from "react";
import Background from "./components/Background.jsx";
import AuthPage from "./components/AuthPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Toasts from "./components/Toasts.jsx";
import { api, setUnauthorizedHandler } from "./api.js";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("petal_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("petal_user") || "");
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((text, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const onAuth = (tok, name) => {
    localStorage.setItem("petal_token", tok);
    localStorage.setItem("petal_user", name);
    setToken(tok);
    setUsername(name);
    toast(`Welcome, ${name}! 💖`);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem("petal_token");
    localStorage.removeItem("petal_user");
    setToken(null);
    setUsername("");
  }, []);

  const logout = async () => {
    try { await api.logout(token); } catch { /* token may already be invalid */ }
    clearSession();
    toast("See you soon 🌷");
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      toast("Session expired, please log in again", "error");
    });
  }, [clearSession, toast]);

  return (
    <>
      <Background />
      {token ? (
        <Dashboard token={token} username={username} onLogout={logout} toast={toast} />
      ) : (
        <AuthPage onAuth={onAuth} toast={toast} />
      )}
      <Toasts toasts={toasts} />
    </>
  );
}
