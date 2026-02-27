import { MongoClient } from "mongodb";

// Prefer environment variables in production; fall back to local Mongo for dev
const url = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(url);

let db;

export async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("examDB");
        console.log('Connected to MongoDB!');
    }
    return db;
}

export async function closeDB() {
    await client.close();
    db = undefined;
    console.log("MongoDB connection closed");
}
