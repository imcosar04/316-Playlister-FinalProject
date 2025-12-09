// client/src/components/SongsCatalogScreen.js
import { useContext, useEffect, useState } from 'react';
import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function SongsCatalogScreen() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('titleAsc');

  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newYouTubeId, setNewYouTubeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSongs() {
      try {
        const response = await storeRequestSender.getSongs();
        const payload = response.data;
        const list = payload && payload.data ? payload.data : [];
        setSongs(list);
      } catch (err) {
        console.error('Failed to load songs catalog', err);
      } finally {
        setLoading(false);
      }
    }
    if (auth.loggedIn) loadSongs();
    else setLoading(false);
  }, [auth.loggedIn]);

  if (!auth.loggedIn) {
    return (
      <Box id="songs-catalog" sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Songs Catalog
        </Typography>
        <Typography>
          Please log in to view and use the Songs Catalog.
        </Typography>
      </Box>
    );
  }

  function filteredAndSortedSongs() {
    let list = [...songs];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        s =>
          (s.title || '').toLowerCase().includes(q) ||
          (s.artist || '').toLowerCase().includes(q) ||
          String(s.year || '').includes(q)
      );
    }

    switch (sortKey) {
      case 'titleAsc':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'titleDesc':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'yearAsc':
        list.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'yearDesc':
        list.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      default:
        break;
    }

    return list;
  }

  function handleAddToCurrentPlaylist(song) {
    if (!store.currentList) return;
    const index = store.getPlaylistSize();
    store.addCreateSongTransaction(
      index,
      song.title,
      song.artist,
      song.year,
      song.youTubeId
    );
  }

  async function handleCreateSong(e) {
    e.preventDefault();
    setError('');

    if (!newTitle.trim() || !newArtist.trim() || !newYouTubeId.trim()) {
      setError('Title, Artist, and YouTube ID are required.');
      return;
    }

    let yearNum = null;
    if (newYear.trim()) {
      yearNum = Number(newYear);
      if (Number.isNaN(yearNum)) {
        setError('Year must be a valid number.');
        return;
      }
    }

    setSaving(true);
    try {
      const response = await storeRequestSender.createSongInCatalog({
        title: newTitle.trim(),
        artist: newArtist.trim(),
        year: yearNum,
        youTubeId: newYouTubeId.trim(),
      });

      const payload = response.data;
      const created = payload && (payload.data || payload);

      setSongs(prev => [...prev, created]);

      setNewTitle('');
      setNewArtist('');
      setNewYear('');
      setNewYouTubeId('');
    } catch (err) {
      console.error('Failed to create catalog song', err);
      setError(err.message || 'Failed to create song.');
    } finally {
      setSaving(false);
    }
  }

  const list = filteredAndSortedSongs();

  if (loading) {
    return (
      <Box id="songs-catalog" sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Songs Catalog
        </Typography>
        <Typography>Loading songs…</Typography>
      </Box>
    );
  }

  return (
    <Box id="songs-catalog" sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Songs Catalog
      </Typography>

      <Box
        component="form"
        onSubmit={handleCreateSong}
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}
      >
        <TextField label="Title" size="small" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
        <TextField label="Artist" size="small" value={newArtist} onChange={e => setNewArtist(e.target.value)} />
        <TextField label="Year" size="small" value={newYear} onChange={e => setNewYear(e.target.value)} />
        <TextField label="YouTube ID" size="small" value={newYouTubeId} onChange={e => setNewYouTubeId(e.target.value)} />
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : 'Add to Catalog'}
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search (title / artist / year)"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          select
          label="Sort By"
          variant="outlined"
          size="small"
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="titleAsc">Title (A–Z)</MenuItem>
          <MenuItem value="titleDesc">Title (Z–A)</MenuItem>
          <MenuItem value="yearAsc">Year (↑)</MenuItem>
          <MenuItem value="yearDesc">Year (↓)</MenuItem>
        </TextField>
      </Box>

      {list.map((song, idx) => (
        <Paper
          key={song.id || song._id || `${song.title}-${song.artist}-${idx}`}
          sx={{ p: 1.5, mb: 1, display: 'flex', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="subtitle1">
              {song.title} ({song.year}) by {song.artist}
            </Typography>
            <Typography variant="body2">
              <a href={`https://www.youtube.com/watch?v=${song.youTubeId}`} target="_blank" rel="noreferrer">
                Watch on YouTube
              </a>
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            disabled={!store.currentList}
            onClick={() => handleAddToCurrentPlaylist(song)}
          >
            {store.currentList ? 'Add to Current Playlist' : 'Open a Playlist First'}
          </Button>
        </Paper>
      ))}

      {list.length === 0 && <Typography>No songs in the catalog yet.</Typography>}
    </Box>
  );
}
