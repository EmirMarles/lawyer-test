import { MongoClient } from "mongodb";

const url = ''
const client = new MongoClient(url);

let db


export async function connectDB() {
    if (!db) {
        await client.connect()
        db = client.db("examDB")
        console.log('Connected to MongoDB!')
    }
    return db
}

export async function closeDB(){
    await client.close();
    console.log("MongoDB connecion closed")
}