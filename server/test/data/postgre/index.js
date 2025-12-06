// server/test/data/postgre/index.js
const path = require('path');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_URL ||
    `${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'playlister'}`,
  {
    dialect: 'postgres',
    logging: false,
  }
);

const User = sequelize.define(
  'User',
  {
    email: { type: DataTypes.STRING, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: 'users', timestamps: false }
);

const Playlist = sequelize.define(
  'Playlist',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    ownerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: User, key: 'email' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    songs: { type: DataTypes.JSONB, allowNull: false }, 
  },
  { tableName: 'playlists', timestamps: false }
);


User.hasMany(Playlist, { foreignKey: 'ownerEmail', sourceKey: 'email' });
Playlist.belongsTo(User, { foreignKey: 'ownerEmail', targetKey: 'email' });


const testData = require(path.join(__dirname, '../example-db-data.json'));
const myPlaylistsData = require(path.join(__dirname, '../ibrahimcosar-playlists.json')); // your 3 custom lists

/**
 * 4) Reset + seed
 */
async function resetPostgres() {
  console.log('Resetting the Postgres DB via Sequelize…');

  // Drop & recreate tables (same spirit as Mongo “clear”)
  await sequelize.sync({ force: true });

  // --- Seed the original users first (so foreign keys will work)
  const baseUsers = (testData.users || []).map(u => ({
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    passwordHash: u.passwordHash,
  }));
  await User.bulkCreate(baseUsers);
  console.log(`Inserted base users: ${baseUsers.length}`);

  const basePlaylists = (testData.playlists || []).map(p => ({
    name: p.name,
    ownerEmail: p.ownerEmail,
    songs: p.songs || [],
  }));
  await Playlist.bulkCreate(basePlaylists);
  console.log(`Inserted base playlists: ${basePlaylists.length}`);

  const sampleHash =
    (testData.users && testData.users[0] && testData.users[0].passwordHash) ||
    '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu';

  const me = await User.create({
    firstName: 'Ibrahim',
    lastName: 'Cosar',
    email: 'ibrahim.cosar@stonybrook.edu',
    passwordHash: sampleHash,
  });
  console.log(`Inserted your user: ${me.email}`);

  // Insert YOUR 3 playlists and attach ownerEmail = your email
  const mine = (myPlaylistsData.playlists || []).map(p => ({
    name: p.name,
    ownerEmail: me.email,
    songs: p.songs || [],
  }));
  await Playlist.bulkCreate(mine);
  console.log(`Inserted your playlists: ${mine.length}`);

  // Sanity check counts
  const [userCount, playlistCount] = await Promise.all([
    User.count(),
    Playlist.count(),
  ]);
  console.log(`Counts ⇒ Users: ${userCount}, Playlists: ${playlistCount}`);

  console.log('Done seeding Postgres.');
}

resetPostgres()
  .catch(err => {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
