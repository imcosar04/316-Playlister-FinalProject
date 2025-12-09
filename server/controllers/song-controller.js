const auth = require('../auth');
const db = require('../db');

// GET all songs with optional sorting
exports.getSongs = async (req, res) => {
  if (auth.verifyUser(req) === null)
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' });

  try {
    const songs = await db.getSongs();
    return res.status(200).json({ success: true, data: songs });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};

// ADD song to catalog
exports.createSong = async (req, res) => {
  if (auth.verifyUser(req) === null)
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' });

  try {
    const song = await db.createSong({
      ...req.body,
      ownerId: req.userId,
    });

    return res.status(201).json({ success: true, song });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};

// UPDATE song in catalog
exports.updateSong = async (req, res) => {
  if (auth.verifyUser(req) === null)
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' });

  try {
    const song = await db.getSongById(req.params.id);

    if (!song)
      return res.status(404).json({ errorMessage: 'Song not found' });

    if (song.ownerId !== req.userId)
      return res.status(400).json({ errorMessage: 'authentication error' });

    const updated = await db.updateSong(req.params.id, req.body);

    return res.status(200).json({ success: true, song: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};

// DELETE song from catalog
exports.deleteSong = async (req, res) => {
  if (auth.verifyUser(req) === null)
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' });

  try {
    const song = await db.getSongById(req.params.id);

    if (!song)
      return res.status(404).json({ errorMessage: 'Song not found' });

    if (song.ownerId !== req.userId)
      return res.status(400).json({ errorMessage: 'authentication error' });

    await db.deleteSong(req.params.id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};
