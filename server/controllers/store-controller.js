const auth = require('../auth')
const db = require('../db')

createPlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  const body = req.body
  if (!body) return res.status(400).json({ success: false, error: 'You must provide a Playlist' })

  try {
    const created = await db.createPlaylist({
      ...body,
      ownerEmail: body.ownerEmail || req.userEmail,
    })

    // ok if this is a no-op in SQL manager
    if (db.appendUserPlaylist) {
      await db.appendUserPlaylist(req.userId, created._id || created.id)
    }

    return res.status(201).json({ playlist: created })
  } catch (_err) {
    return res.status(400).json({ errorMessage: 'Playlist Not Created!' })
  }
}

deletePlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(404).json({ errorMessage: 'Playlist not found!' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ errorMessage: 'authentication error' })
    }

    await db.deletePlaylistById(req.params.id)
    return res.status(200).json({})
  } catch (_err) {
    return res.status(400).json({ errorMessage: 'Playlist not found!' })
  }
}

getPlaylistById = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(400).json({ success: false, error: 'Not found' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ success: false, description: 'authentication error' })
    }
    return res.status(200).json({ success: true, playlist: list })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

getPlaylistPairs = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const user = await db.getUserById(req.userId)
    const playlists = await db.getPlaylistPairs({ ownerEmail: user.email })

    const pairs = (playlists || []).map(p => ({
      _id: p._id || p.id,
      name: p.name,
    }))
    return res.status(200).json({ success: true, idNamePairs: pairs })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

getPlaylists = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const lists = await db.getPlaylists({}) // no filter: fetch all (or implement owner scoping)
    if (!lists || !lists.length) return res.status(404).json({ success: false, error: 'Playlists not found' })
    return res.status(200).json({ success: true, data: lists })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

updatePlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  const body = req.body
  if (!body) return res.status(400).json({ success: false, error: 'You must provide a body to update' })

  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(404).json({ message: 'Playlist not found!' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ success: false, description: 'authentication error' })
    }

    const updated = await db.updatePlaylistById(req.params.id, {
      name: body.playlist.name,
      songs: body.playlist.songs,
    })

    return res
      .status(200)
      .json({ success: true, id: updated._id || updated.id, message: 'Playlist updated!' })
  } catch (error) {
    return res.status(404).json({ error, message: 'Playlist not updated!' })
  }
}

copyPlaylist = async (req, res) => {
  console.log("copyPlaylist controller, id:", req.params.id, "userId:", req.userId)

  // Auth check (same pattern as the others)
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }

  try {
    // Load original playlist
    const original = await db.getPlaylistById(req.params.id)
    if (!original) {
      return res
        .status(404)
        .json({ success: false, errorMessage: 'Original playlist not found' })
    }

    // Ownership check: only owner can copy
    const owner = await db.getUserByEmail(original.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res
        .status(400)
        .json({ success: false, errorMessage: 'authentication error' })
    }

    const baseName = original.name || 'Untitled'
    let newName = `${baseName} (copy)`

    try {
      const pairs = await db.getPlaylistPairs({ ownerEmail: original.ownerEmail }) || []
      const existingNames = new Set(pairs.map(p => p.name))

      let copyIndex = 1
      let candidate = newName
      while (existingNames.has(candidate)) {
        copyIndex += 1
        candidate = `${baseName} (copy ${copyIndex})`
      }
      newName = candidate
    } catch (nameErr) {
      console.warn('copyPlaylist: could not ensure unique name, using default', nameErr)
    }

    const newPlaylistData = {
      name: newName,
      ownerEmail: original.ownerEmail,
      songs: (original.songs || []).map(s => ({
        title: s.title,
        artist: s.artist,
        year: s.year,
        youTubeId: s.youTubeId,
      })),
    }

    const created = await db.createPlaylist(newPlaylistData)

    if (db.appendUserPlaylist) {
      try {
        await db.appendUserPlaylist(req.userId, created._id || created.id)
      } catch (appendErr) {
        console.warn('copyPlaylist: appendUserPlaylist failed, continuing anyway', appendErr)
      }
    }

    // Success response
    return res.status(201).json({
      success: true,
      playlist: created,
    })
  } catch (err) {
    console.error('Error in copyPlaylist:', err)
    return res
      .status(400)
      .json({ success: false, errorMessage: 'Playlist not copied!' })
  }
}


module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistPairs,
  getPlaylists,
  updatePlaylist,
  copyPlaylist,
}