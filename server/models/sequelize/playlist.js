// server/models/sequelize/playlist.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const jsonType = sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;

  const Playlist = sequelize.define(
    'Playlist',
    {
      // Default "id" PK is fine.
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Keep ownerEmail to match your existing controllers/queries
      ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },

      // Optional FK to User (lets us link rows properly)
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      songs: {
        type: jsonType,
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: 'playlists',
      timestamps: true,
      underscored: false,
      indexes: [
        { fields: ['ownerEmail'] },
        { fields: ['name'] },
      ],
    }
  );

  return Playlist;
};
