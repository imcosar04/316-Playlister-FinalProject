class DatabaseManager {
  // lifecycle
  async connect()    { throw new Error('Not implemented'); }
  async disconnect() { throw new Error('Not implemented'); }

  // users
  async getUserByEmail(email) { throw new Error('Not implemented'); }
  async createUser(userData)  { throw new Error('Not implemented'); }

  // playlists (match exactly what your controllers need)
  async createPlaylist(data)              { throw new Error('Not implemented'); }
  async getPlaylistById(id)               { throw new Error('Not implemented'); }
  async getPlaylistPairs()                { throw new Error('Not implemented'); }
  async updatePlaylistById(id, updates)   { throw new Error('Not implemented'); }
  async deletePlaylistById(id)            { throw new Error('Not implemented'); }
}

module.exports = DatabaseManager;