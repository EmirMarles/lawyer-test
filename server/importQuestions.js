import fs from "fs";
import { MongoClient } from "mongodb";

// MongoDB connection URI
const uri = "mongodb://localhost:27017"; // or your Atlas URI
const client = new MongoClient(uri);

async function main() {
    try {
        await client.connect();

        const db = client.db("examDB");
        const collection = db.collection("questions");

        // Read the JSON file
        const questions = JSON.parse(fs.readFileSync("questions.json", "utf-8"));

        // Optional: clear old data
        await collection.deleteMany({});

        // Insert all questions
        const result = await collection.insertMany(questions);
        console.log("✅ Inserted", result.insertedCount, "questions");
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();
