const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });

async function clearCollection(collection, collectionName) {
    try {
        await collection.deleteMany({});
        console.log(collectionName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillCollection(collection, collectionName, data) {
    for (let i = 0; i < data.length; i++) {
        let doc = new collection(data[i]);
        await doc.save();
    }
    console.log(collectionName + " filled");
}

async function resetMongo() {
    const Playlist = require('../../../models/playlist-model')
    const User = require("../../../models/user-model")
    const testData = require("../example-db-data.json")
    const myPlaylistsData = require("../ibrahimcosar-playlists.json");

    console.log("Resetting the Mongo DB")

    // 1) Clear in any order
    await clearCollection(Playlist, "Playlist");
    await clearCollection(User, "User");

    // 2) Fill the provided seed data
    // Inserting users first
    await fillCollection(User, "User", testData.users);
    await fillCollection(Playlist, "Playlist", testData.playlists);

    const sampleHash =
        (testData.users && testData.users[0] && testData.users[0].passwordHash) ||
        '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu';
    
    // 3) Adding my extra user
    const myUser = new User({
        firstName: 'Ibrahim',
        lastName: 'Cosar',
        email: 'ibrahim.cosar@stonybrook.edu',
        passwordHash: sampleHash,
        playlists: []
    });
    await myUser.save();
    console.log("Added your user:", myUser.email);

    // 4) Add your HW3 playlists
    const insertedIds = [];
    for (const p of myPlaylistsData.playlists || []) {
        const doc = new Playlist({
            ...p,
            ownerEmail: myUser.email, // schema uses ownerEmail (not owner ObjectId)
        });
        await doc.save();
        insertedIds.push(doc._id);
    }
    console.log(`Added ${insertedIds.length} playlists owned by ${myUser.firstName}`);

    // 5) Update your user's playlists array with the inserted ids
    myUser.playlists = insertedIds;
    await myUser.save();

    console.log("✅ Done seeding MongoDB.");
}

const mongoose = require('mongoose')
mongoose
    .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    .then(() => { resetMongo() })
    .catch(e => {
        console.error('Connection error', e.message)
    })


