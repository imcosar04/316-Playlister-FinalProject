// server/db/index.js
const MongoDBManager = require('./managers/mongo-db-manager');
const SQLDBManager   = require('./managers/sql-db-manager');

const vendor = (process.env.DB_VENDOR || 'mongo').toLowerCase();
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

module.exports = manager;

