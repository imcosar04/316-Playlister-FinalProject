/*
  Auth HTTP API using the Fetch API (no Axios / no XHR)
*/

const BASE = 'http://localhost:4000/auth';

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include', 
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const err = new Error(
      (data && (data.errorMessage || data.message)) || res.statusText || 'Request failed'
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

// SAME endpoints & names as before

export const getLoggedIn = () =>
  jsonFetch(`${BASE}/loggedIn/`, { method: 'GET' });

export const loginUser = (email, password) =>
  jsonFetch(`${BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const logoutUser = () =>
  jsonFetch(`${BASE}/logout/`, { method: 'GET' });

export const registerUser = (firstName, lastName, email, password, passwordVerify) =>
  jsonFetch(`${BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, passwordVerify }),
  });

const apis = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
};

export default apis;