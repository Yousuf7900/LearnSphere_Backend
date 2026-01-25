
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


// mongodb configuration

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@learning.9ft5due.mongodb.net/?appName=Learning`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("Server connected to the Database!");


        //User Collection and user related apis
        const usersCollection = client.db('learnSphereDB').collection('users');

        // Insert new user on users collection
        app.put('/user/:uid', async (req, res) => {
            const uid = req.params.uid;
            const userData = req.body;
            const filter = { uid };
            const updateDocument = {
                $set: {
                    uid,
                    name: userData.name,
                    email: userData.email,
                    photoURL: userData.photoURL,
                    lastLoginAt: userData.lastLoginAt,
                    lastSignInTime: userData.lastSignInTime,
                },
                $setOnInsert: {
                    createdAt: userData.createdAt,
                    creationTime: userData.creationTime
                }
            }
            const result = await usersCollection.updateOne(filter, updateDocument, { upsert: true });
            res.send({ ok: true, inserted: !!result.upsertedId });
        })


        // tutorials collection
        const tutorialsCollection = client.db('learnSphereDB').collection('tutorials');
        // Add new tutorials
        app.post('/tutorials/', async (req, res) => {
            const tutorialData = req.body;
            const result = await tutorialsCollection.insertOne(tutorialData);
            res.send(result);
        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server connected successfully');
})
app.listen(port, () => {
    console.log(`Server running on : ${port}`);
})

