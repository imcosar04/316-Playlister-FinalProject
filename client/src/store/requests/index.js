/*
    We are using the fetch API now for our requests from the client to the server.
    Fetch is a bit lower level than axios, so we have to do a bit more work.
*/
const BASE = 'http://localhost:4000/store';
const SONG_BASE = 'http://localhost:4000/api';

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Accept': 'application/json', ...(options.headers || {}) },
    ...options,
  });

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

/** PLAYLIST APIs **/
export function createPlaylist(name, songs, ownerEmail) {
  return jsonFetch(`${BASE}/playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, songs, ownerEmail }),
  });
}

export function deletePlaylistById(id) {
  return jsonFetch(`${BASE}/playlist/${id}`, { method: 'DELETE' });
}

export function copyPlaylist(id) {
  return jsonFetch(`${BASE}/playlist/${id}/copy`, {
    method: 'POST',
  });
}

export function getPlaylistById(id) {
  return jsonFetch(`${BASE}/playlist/${id}`, { method: 'GET' });
}

export function getPlaylistPairs() {
  return jsonFetch(`${BASE}/playlistpairs`, { method: 'GET' });
}

export function updatePlaylistById(id, playlist) {
  return jsonFetch(`${BASE}/playlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist }),
  });
}

/** SONG CATALOG APIs **/
export function getSongs() {
  return jsonFetch(`${SONG_BASE}/songs`, {
    method: 'GET',
  });
}

export function createSong(song) {
  return jsonFetch(`${SONG_BASE}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
}

export function updateSong(id, song) {
  return jsonFetch(`${SONG_BASE}/songs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
}

export function deleteSong(id) {
  return jsonFetch(`${SONG_BASE}/songs/${id}`, {
    method: 'DELETE',
  });
}

export function createSongInCatalog(song) {
  return createSong(song);
}

const apis = {
  // playlists
  createPlaylist,
  deletePlaylistById,
  copyPlaylist,
  getPlaylistById,
  getPlaylistPairs,
  updatePlaylistById,
  // songs
  createSongInCatalog,
  getSongs,
  createSong,
  updateSong,
  deleteSong,
};

export default apis;
