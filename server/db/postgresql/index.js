// server/db/index.js

const MongoDBManager = require('./managers/mongo-db-manager');
const SQLDBManager = require('./managers/sql-db-manager');

const rawVendor = process.env.DB_VENDOR || 'mongo';
const vendor = rawVendor.toLowerCase();

if (vendor === 'sql' || vendor === 'sequelize' || vendor === 'postgres' || vendor === 'postgresql') {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is required when DB_VENDOR=sql');
  }
} else if (vendor === 'mongo') {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required when DB_VENDOR=mongo');
  }
}

let manager;
switch (vendor) {
  case 'sql':
  case 'sequelize':
  case 'postgres':
  case 'postgresql':
    manager = new SQLDBManager();
    break;
  case 'mongo':
  default:
    manager = new MongoDBManager();
    break;
}

manager.__vendor = (vendor === 'sequelize' || vendor === 'postgres' || vendor === 'postgresql') ? 'sql' : vendor;

module.exports = manager;
