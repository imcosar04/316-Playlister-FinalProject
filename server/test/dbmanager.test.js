// server/test/dbmanager.test.js
import { beforeAll, afterAll, beforeEach, test, expect, describe } from 'vitest';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = require('../db');

// tiny helper for unique strings per run
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const KNOWN_USER_EMAIL = 'joe@shmo.com'; // from your seed JSON

describe('DatabaseManager contract', () => {
  let createdUserIds = [];
  let createdPlaylistIds = [];

  beforeAll(async () => {
    // Connect once
    if (typeof db.connect === 'function') {
      await db.connect();
    }
  });

  afterAll(async () => {
    // Best-effort cleanup for playlists (users have no delete method in the interface)
    for (const pid of createdPlaylistIds) {
      try { await db.deletePlaylistById(pid); } catch {}
    }
    if (typeof db.disconnect === 'function') {
      await db.disconnect();
    }
  });

  beforeEach(() => {
  });

  // -------- users --------

  test('getUserByEmail() should find a known seeded user', async () => {
    const user = await db.getUserByEmail(KNOWN_USER_EMAIL);
    expect(user).toBeTruthy();
    // Allow SQL (camelCase) and Mongoose (plain object) shapes
    const firstName = user.firstName ?? user.dataValues?.firstName;
    const lastName  = user.lastName  ?? user.dataValues?.lastName;
    const email     = user.email     ?? user.dataValues?.email;

    expect(email).toBe(KNOWN_USER_EMAIL);
    expect(firstName).toBeDefined();
    expect(lastName).toBeDefined();
  });

  test('createUser() should insert a user that can be fetched back by email', async () => {
    const email = `test_${uid()}@example.com`;
    const payload = {
      firstName: 'Unit',
      lastName: 'Tester',
      email,
      passwordHash: '$2a$10$dummyhashfortestonly______________',
    };

    const created = await db.createUser(payload);
    createdUserIds.push(created?._id ?? created?.id ?? created?.dataValues?.id ?? null);

    // Read back
    const fetched = await db.getUserByEmail(email);
    const fEmail = fetched?.email ?? fetched?.dataValues?.email;
    const fFirst = fetched?.firstName ?? fetched?.dataValues?.firstName;
    const fLast  = fetched?.lastName ?? fetched?.dataValues?.lastName;

    expect(fEmail).toBe(email);
    expect(fFirst).toBe('Unit');
    expect(fLast).toBe('Tester');
  });

  // -------- playlists --------

  test('createPlaylist() → getPlaylistById() roundtrip', async () => {
    const ownerEmail = KNOWN_USER_EMAIL;
    const name = `UT_${uid()}`;
    const pl = await db.createPlaylist({ name, ownerEmail, songs: [] });
    const id = pl?._id?.toString?.() ?? pl?.id ?? pl?.dataValues?.id;
    expect(id).toBeTruthy();
    createdPlaylistIds.push(id);

    const got = await db.getPlaylistById(id);
    const gotName = got?.name ?? got?.dataValues?.name;
    const gotOwner = got?.ownerEmail ?? got?.dataValues?.ownerEmail;

    expect(gotName).toBe(name);
    expect(gotOwner).toBe(ownerEmail);
  });

  test('updatePlaylistById() should modify fields and return the updated row/doc', async () => {
    const ownerEmail = KNOWN_USER_EMAIL;
    const name = `UT_${uid()}`;
    const pl = await db.createPlaylist({ name, ownerEmail, songs: [] });
    const id = pl?._id?.toString?.() ?? pl?.id ?? pl?.dataValues?.id;
    createdPlaylistIds.push(id);

    const newName = `${name}_updated`;
    const updated = await db.updatePlaylistById(id, { name: newName });
    const updatedName = updated?.name ?? updated?.dataValues?.name;

    expect(updatedName).toBe(newName);

    const fetched = await db.getPlaylistById(id);
    const fetchedName = fetched?.name ?? fetched?.dataValues?.name;
    expect(fetchedName).toBe(newName);
  });

  test('getPlaylistPairs() should return pairs and include a filtered one we just created', async () => {
    const ownerEmail = KNOWN_USER_EMAIL;
    const prefix = `PX_${uid()}`;
    const pl = await db.createPlaylist({ name: `${prefix}_alpha`, ownerEmail, songs: [] });
    const id = pl?._id?.toString?.() ?? pl?.id ?? pl?.dataValues?.id;
    createdPlaylistIds.push(id);

    const pairs = await db.getPlaylistPairs({ ownerEmail, namePrefix: prefix });
    expect(Array.isArray(pairs)).toBe(true);
    expect(pairs.length).toBeGreaterThanOrEqual(1);

    const found = pairs.find(p => (p.name === `${prefix}_alpha`) && (p.ownerEmail === ownerEmail));
    expect(found).toBeTruthy();
    expect(found._id || found.id).toBeTruthy();
  });

  test('deletePlaylistById() should remove the playlist', async () => {
    const ownerEmail = KNOWN_USER_EMAIL;
    const name = `DEL_${uid()}`;
    const pl = await db.createPlaylist({ name, ownerEmail, songs: [] });
    const id = pl?._id?.toString?.() ?? pl?.id ?? pl?.dataValues?.id;

    // delete
    const delResult = await db.deletePlaylistById(id);
    // Mongo returns the deleted doc (or null), SQL returns a number of rows deleted
    if (typeof delResult === 'number') {
      expect(delResult).toBe(1);
    } else {
      // deleted doc or null if already gone
      expect(delResult === null || delResult?._id || delResult?.id).toBeTruthy();
    }

    // verify gone
    const after = await db.getPlaylistById(id);
    expect(after).toBeFalsy();
  });

  // -------- lifecycle (smoke) --------

  test('connect()/disconnect() are callable (smoke)', async () => {
    if (typeof db.disconnect === 'function') {
      await db.disconnect();
    }
    if (typeof db.connect === 'function') {
      await db.connect();
    }
    // If no error thrown, we’re good.
    expect(true).toBe(true);
  });
});
