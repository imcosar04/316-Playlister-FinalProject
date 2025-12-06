const DatabaseManager = require('../DatabaseManager');
const mongoose = require('mongoose');

const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');

class MongoDBManager extends DatabaseManager {
  async connect() {
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  async disconnect() { await mongoose.disconnect(); }

  async getUserByEmail(email) { return User.findOne({ email }).lean(); }
  async createUser(userData)  { const u = new User(userData); return u.save(); }

  async createPlaylist(data)            { const p = new Playlist(data); return p.save(); }
  async getPlaylistById(id)             { return Playlist.findById(id).lean(); }
  async getPlaylistPairs()              { return Playlist.find({}, { name:1, ownerEmail:1 }).lean(); }
  async updatePlaylistById(id, updates) { return Playlist.findByIdAndUpdate(id, updates, { new:true }).lean(); }
  async deletePlaylistById(id)          { return Playlist.findByIdAndDelete(id).lean(); }
}

module.exports = new MongoDBManager();
