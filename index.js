
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
        console.log("Server connected with the Database!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

