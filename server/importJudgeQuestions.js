import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all questions (already parsed with categories like "I.", "II.", etc.)
const allQuestions = require('../judge-questions.cjs');

// Mapping from roman numeral to full category name
const ROMAN_TO_CATEGORY = {
  'I.': 'Вопросы по Уголовно-процессуальному праву Кыргызской Республики',
  'II.': 'Вопросы по Уголовно-исполнительному законодательству Кыргызской Республики',
  'III.': 'Вопросы по Трудовому праву Кыргызской Республики',
  'IV.': 'Вопросы по Семейному праву Кыргызской Республики',
  'V.': 'Вопросы по Международному праву',
  'VI.': 'Вопросы по Конституционному праву Кыргызской Республики',
  'VII.': 'Вопросы по Уголовному праву Кыргызской Республики',
  'VIII.': 'Вопросы по Исполнительному производству',
  'IX.': 'Вопросы по Таможенному праву Кыргызской Республики',
  'X.': 'Вопросы по Таможенному праву Кыргызской Республики',
  'XI.': 'Вопросы по Гражданскому процессуальному праву Кыргызской Республики',
  'XII.': 'Вопросы по Досудебным (внесудебным) способам урегулирования спора',
  'XIII.': 'Вопросы по Гендерному праву',
  'XIV.': 'Вопросы по Административно-процессуальному праву Кыргызской Республики',
  'XV.': 'Вопросы по Гражданскому праву Кыргызской Республики',
  'XVI.': 'Вопросы по Земельному праву Кыргызской Республики',
  'XVII.': 'Вопросы по Природоресурсному праву',
  'XVIII.': 'Вопросы по компьютерной грамотности',
};

// Prefer env var in production, fall back to local Mongo for dev
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    const db = client.db('examDB');
    const collection = db.collection('questions');

    console.log('Clearing existing questions collection…');
    await collection.deleteMany({});

    const docs = allQuestions.map((q) => {
      const categoryKey = (q.category || 'UNCLASSIFIED').trim();
      const categoryName = ROMAN_TO_CATEGORY[categoryKey] || 'UNCLASSIFIED';
      return {
        ...q,
        categoryKey,
        categoryName,
      };
    });

    const result = await collection.insertMany(docs);
    console.log('✅ Inserted', result.insertedCount, 'questions into "questions" collection');
  } catch (err) {
    console.error('Error importing judge questions:', err);
  } finally {
    await client.close();
  }
}

main();

