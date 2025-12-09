const express = require('express');
const SongController = require('../controllers/song-controller');
const auth = require('../auth');

const router = express.Router();

router.get('/songs', auth.verify, SongController.getSongs);
router.post('/songs', auth.verify, SongController.createSong);
router.put('/songs/:id', auth.verify, SongController.updateSong);
router.delete('/songs/:id', auth.verify, SongController.deleteSong);

module.exports = router;
