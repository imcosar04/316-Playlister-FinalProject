// server/db/managers/sql-db-manager.js
const { Sequelize, Op } = require('sequelize');
const DatabaseManager = require('../../db/DatabaseManager');

class SQLDBManager extends DatabaseManager {
  constructor() {
    super();
    this.sequelize = null;
    this.models = null;
  }

  async connect() {
    const url =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/playlister';

    this.sequelize = new Sequelize(url, {
      logging: false,
      dialectOptions: process.env.PGSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
    });

    const initModels = require('../../models/sequelize');
    this.models = initModels(this.sequelize);

    await this.sequelize.authenticate();
    await this.sequelize.sync(); // consider { alter: true } during dev
  }

  async disconnect() {
    if (this.sequelize) await this.sequelize.close();
  }

  // ===== USERS =====
  async getUserById(id) {
    return this.models.User.findByPk(id);
  }

  async getUserByEmail(email) {
    return this.models.User.findOne({ where: { email } });
  }

  async createUser(userData) {
    return this.models.User.create(userData);
  }

  // Link playlist to user if your schema has ownerId; otherwise safe no-op
  async appendUserPlaylist(userId, playlistId) {
    try {
      const playlist = await this.models.Playlist.findByPk(playlistId);
      if (!playlist) return;
      if ('ownerId' in playlist) {
        playlist.ownerId = userId;
        await playlist.save();
      }
    } catch {
      // safe no-op
    }
  }

  // ===== PLAYLISTS =====
  async createPlaylist(data) {
    return this.models.Playlist.create(data);
  }

  async getPlaylistById(id) {
    return this.models.Playlist.findByPk(id);
  }

  async updatePlaylistById(id, updates) {
    const row = await this.models.Playlist.findByPk(id);
    if (!row) return null;
    return row.update(updates);
  }

  async deletePlaylistById(id) {
    return this.models.Playlist.destroy({ where: { id } });
  }

  async getPlaylists(filter = {}) {
    const where = {};
    if (filter.ownerEmail) where.ownerEmail = filter.ownerEmail;
    if (filter.namePrefix) where.name = { [Op.iLike]: `${filter.namePrefix}%` };
    return this.models.Playlist.findAll({ where });
  }

  async getPlaylistPairs(filter = {}) {
    const rows = await this.getPlaylists(filter);
    return rows.map(p => ({
      id: p.id,
      name: p.name,
      ownerEmail: p.ownerEmail,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }));
  }
}

module.exports = SQLDBManager;
