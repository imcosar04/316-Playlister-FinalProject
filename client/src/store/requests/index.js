/*
    We are using the fetch API now for our requests from the client to the server.
    Fetch is a bit lower level than axios, so we have to do a bit more work.
*/
const BASE = 'http://localhost:4000/store';

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',       
    headers: { 'Accept': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  // Try to read JSON if present
  const contentType = res.headers.get('content-type') || '';
  const hasJson = contentType.includes('application/json');
  const data = hasJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg = 
      (data && (data.errorMessage || data.message)) ||
      res.statusText ||
      'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

export function createPlaylist(name, songs, ownerEmail) {
  return jsonFetch(`${BASE}/playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, songs, ownerEmail }),
  });
}
/** DELETE */
export function deletePlaylistById(id) {
  return jsonFetch(`${BASE}/playlist/${id}`, { method: 'DELETE' });
}

/** GET Playlist by ID*/
export function getPlaylistById(id) {
  return jsonFetch(`${BASE}/playlist/${id}`, { method: 'GET' });
}
/** GET Playlist by Pairs*/
export function getPlaylistPairs() {
  return jsonFetch(`${BASE}/playlistpairs`, { method: 'GET' });
}
/** PUT */
export function updatePlaylistById(id, playlist) {
  return jsonFetch(`${BASE}/playlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist }),
  });
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis
