// server/db/managers/mongo-db-manager.js
const mongoose = require('mongoose');
const DatabaseManager = require('../../db/DatabaseManager');

// Mongoose models (adjust paths if your layout differs)
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');

class MongoDBManager extends DatabaseManager {
  async connect() {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/playlister';
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
  }

  async disconnect() {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }

  // ===== USERS =====
  async getUserById(id) {
    return User.findById(id).exec();
  }

  async getUserByEmail(email) {
    return User.findOne({ email }).exec();
  }

  async createUser(userData) {
    return User.create(userData);
  }

  // If your User schema has playlists: [ObjectId], append the new playlist
  async appendUserPlaylist(userId, playlistId) {
    try {
      const user = await User.findById(userId).exec();
      if (!user) return;
      const pid = String(playlistId);
      if (!Array.isArray(user.playlists)) user.playlists = [];
      if (!user.playlists.some(p => String(p) === pid)) {
        user.playlists.push(playlistId);
        await user.save();
      }
    } catch {
      // safe no-op if schema doesn’t include playlists
    }
  }

  // ===== PLAYLISTS =====
  async createPlaylist(data) {
    return Playlist.create(data);
  }

  async getPlaylistById(id) {
    return Playlist.findById(id).exec();
  }

  async updatePlaylistById(id, updates) {
    return Playlist.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deletePlaylistById(id) {
    return Playlist.findByIdAndDelete(id).exec();
  }

  async getPlaylists(filter = {}) {
    const q = {};
    if (filter.ownerEmail) q.ownerEmail = filter.ownerEmail;
    if (filter.namePrefix) q.name = { $regex: `^${filter.namePrefix}`, $options: 'i' };
    return Playlist.find(q).exec();
  }

  async getPlaylistPairs(filter = {}) {
    const docs = await this.getPlaylists(filter);
    return docs.map(p => ({
      _id: p._id,
      id: p._id?.toString?.(),
      name: p.name,
      ownerEmail: p.ownerEmail,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }));
  }
}

module.exports = MongoDBManager;

