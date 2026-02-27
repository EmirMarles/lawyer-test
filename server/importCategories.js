import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { MongoClient } from 'mongodb';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory with per-category question files produced by splitByCategories.js
const categoriesDir = path.join(__dirname, '..', 'categories-by-roman');

// Prefer env var in production, fall back to local Mongo
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db('examDB');
    const collection = db.collection('questionsByCategory');

    const files = fs
      .readdirSync(categoriesDir)
      .filter((f) => f.endsWith('.cjs'));

    if (!files.length) {
      console.error('No .cjs files found in', categoriesDir);
      return;
    }

    console.log('Clearing existing questionsByCategory collection…');
    await collection.deleteMany({});

    let totalInserted = 0;

    for (const file of files) {
      const fullPath = path.join(categoriesDir, file);
      const data = require(fullPath);

      if (!Array.isArray(data) || data.length === 0) {
        console.warn('Skipping empty or invalid file:', file);
        continue;
      }

      const base = path.basename(file, '.cjs'); // e.g. "I_Вопросы_по_..." or "UNCLASSIFIED"
      const [romanPart] = base.split('_');
      const categoryKey = romanPart === 'UNCLASSIFIED' ? 'UNCLASSIFIED' : `${romanPart}.`;

      const categoryName = data[0].category || 'UNCLASSIFIED';

      const docs = data.map((q) => ({
        ...q,
        categoryKey,
        categoryName,
      }));

      const result = await collection.insertMany(docs);
      totalInserted += result.insertedCount;
      console.log(`Inserted ${result.insertedCount} from ${file} as categoryKey="${categoryKey}"`);
    }

    console.log('✅ Total inserted into questionsByCategory:', totalInserted);
  } catch (err) {
    console.error('Error importing categories:', err);
  } finally {
    await client.close();
  }
}

main();

