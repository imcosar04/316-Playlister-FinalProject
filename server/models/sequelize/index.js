// server/models/sequelize/index.js
const defineUser = require('./user');
const definePlaylist = require('./playlist');
const defineSong = require('./song');

module.exports = (sequelize) => {
  const User = defineUser(sequelize);
  const Playlist = definePlaylist(sequelize);
  const Song = defineSong(sequelize);

  // Associations (optional but useful)
  // One user -> many playlists (FK: ownerId)
  User.hasMany(Playlist, { foreignKey: 'ownerId', as: 'playlists' });
  Playlist.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

  User.hasMany(Song, { foreignKey: 'ownerId', as: 'songs' });
  Song.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

  return { User, Playlist, Song };
};
