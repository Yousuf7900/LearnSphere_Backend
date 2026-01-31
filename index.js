
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // get all tutorials
        app.get('/all-tutorials', async (req, res) => {
            const result = await tutorialsCollection.find().toArray();
            res.send(result);
        })

        // to get my-tutorials by email
        app.get('/all-tutorials/:email', async (req, res) => {
            const email = req.params.email;
            const result = await tutorialsCollection.find({ tutorEmail: email }).toArray();
            res.send(result);
        })
        // get specific tutor detail by id
        app.get('/tutor-details/:id', async (req, res) => {
            const tutor_id = req.params.id;
            const query = { _id: new ObjectId(tutor_id) };
            const result = await tutorialsCollection.findOne(query);
            res.send(result);
        })



        // bookings collection
        const bookingsCollection = client.db('learnSphereDB').collection('bookings');
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const bookings = await bookingsCollection.find({ userEmail: email }).toArray();
            if (bookings.length === 0) {
                return res.send([]);
            }
            const tutorIds = bookings.map(b => new ObjectId(b.tutorId));
            const tutors = await tutorialsCollection.find({ _id: { $in: tutorIds } }).toArray();
            const result = bookings.map(b => {
                const tutor = tutors.find(t => t._id.toString() === b.tutorId);
                return {
                    bookingId: b._id,
                    tutorId: b.tutorId,
                    name: tutor?.tutorName,
                    image: tutor?.tutorPhoto,
                    language: tutor?.language,
                    price: tutor?.price,
                    review: tutor?.review,
                    tutorEmail: tutor?.tutorEmail,
                    userEmail: b.userEmail
                }
            });
            res.send(result);
        })

        app.patch('/tutors/review/:id', async (req, res) => {
            const tutorId = req.params.id;
            const result = await tutorialsCollection.updateOne({ _id: new ObjectId(tutorId) }, { $inc: { review: 1 } });
            res.send(result);
        })

        app.delete('/tutorials/:id', async (req, res) => {
            const id = req.params.id;
            const result = await tutorialsCollection.deleteOne({
                _id: new ObjectId(id)
            });
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

