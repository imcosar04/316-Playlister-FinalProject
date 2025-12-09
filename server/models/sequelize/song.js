// server/models/sequelize/song.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Song = sequelize.define(
    'Song',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      artist: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      youTubeId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      listens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      playlistCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'songs',
      timestamps: true,
      underscored: false,
      indexes: [
        { fields: ['title'] },
        { fields: ['artist'] },
        { fields: ['year'] },
      ],
    }
  );

  return Song;
};
