// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.CLIENT_ORIGIN || 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth-router');
app.use('/auth', authRouter);

const storeRouter = require('./routes/store-router');
app.use('/store', storeRouter);

const songRouter = require('./routes/song-router');
app.use('/api', songRouter);

const db = require('./db');

(async () => {
  try {
    console.log(`Using DB vendor: ${db.__vendor || process.env.DB_VENDOR || 'mongo'}`);
    if (typeof db.connect === 'function') {
      await db.connect();
      console.log(`Connected to ${db.__vendor || process.env.DB_VENDOR || 'mongo'} database`);
    }

    app.listen(PORT, () => console.log(`Playlister Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

