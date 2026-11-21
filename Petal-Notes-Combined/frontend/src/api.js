// Thin wrapper over the Express backend (proxied through /api in dev).
// Set VITE_API_URL at build time to point at a deployed backend instead.
const BASE = import.meta.env.VITE_API_URL || "/api";

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function request(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) throw new Error(data.msg || "Something went wrong");
  return data;
}

export const api = {
  register: (username, email, password) =>
    request("/user/register", { method: "POST", body: { username, email, password } }).then((d) => {
      // backend answers 200 even when it fails, so check the message
      if (d.msg !== "User registered successfully") throw new Error("Could not register. That username or email may already be taken.");
      return d;
    }),
  login: (email, password) => request("/user/login", { method: "POST", body: { email, password } }),
  logout: (token) => request("/user/logout", { token }),
  getNotes: (token) => request("/note/read", { token }).then((d) => d.notes || []),
  createNote: (token, title, content) =>
    request("/note/create", { method: "POST", token, body: { title, content } }).then((d) => d.note),
  updateNote: (token, id, title, content) =>
    request(`/note/update/${id}`, { method: "PATCH", token, body: { title, content } }).then((d) => d.updatedNote),
  deleteNote: (token, id) => request(`/note/delete/${id}`, { method: "DELETE", token }),
};
