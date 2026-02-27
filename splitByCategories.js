// splitByCategories.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all parsed questions (from your existing parser)
const questions = require('./judge-questions.cjs');

// Mapping from roman numeral to full category name
const ROMAN_TO_CATEGORY = {
  'I.':  'Вопросы по Уголовно-процессуальному праву Кыргызской Республики',
  'II.': 'Вопросы по Уголовно-исполнительному законодательству Кыргызской Республики',
  'III.':'Вопросы по Трудовому праву Кыргызской Республики',
  'IV.': 'Вопросы по Семейному праву Кыргызской Республики',
  'V.':  'Вопросы по Международному праву',
  'VI.': 'Вопросы по Конституционному праву Кыргызской Республики',
  'VII.':'Вопросы по Уголовному праву Кыргызской Республики',
  'VIII.':'Вопросы по Исполнительному производству',
  'IX.': 'Вопросы по Таможенному праву Кыргызской Республики',
  'X.':  'Вопросы по Таможенному праву Кыргызской Республики',
  'XI.': 'Вопросы по Гражданскому процессуальному праву Кыргызской Республики',
  'XII.':'Вопросы по Досудебным (внесудебным) способам урегулирования спора',
  'XIII.':'Вопросы по Гендерному праву',
  'XIV.':'Вопросы по Административно-процессуальному праву Кыргызской Республики',
  'XV.': 'Вопросы по Гражданскому праву Кыргызской Республики',
  'XVI.':'Вопросы по Земельному праву Кыргызской Республики',
  'XVII.':'Вопросы по Природоресурсному праву',
  'XVIII.':'Вопросы по компьютерной грамотности',
};

function slugifyFileName(roman, name) {
  // Use roman as base (I, II, ...) and append a short slug from the Russian name
  const cleanRoman = roman.replace(/\./g, '');
  const short = name
    .split(/\s+/)
    .slice(0, 3)
    .join('_')
    .replace(/[^a-zA-Z0-9_а-яА-Я-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${cleanRoman}_${short || 'category'}.cjs`;
}

function main() {
  const outDir = path.join(__dirname, 'categories-by-roman');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Group questions by roman numeral (assumes question.category is like "I.", "II.", etc.)
  const grouped = new Map();

  for (const q of questions) {
    const roman = (q.category || '').trim(); // e.g. "I."
    const fullName = ROMAN_TO_CATEGORY[roman] || 'UNCLASSIFIED';

    if (!grouped.has(roman)) {
      grouped.set(roman, { fullName, list: [] });
    }
    // In the per-category files we store the friendly category name
    grouped.get(roman).list.push({
      ...q,
      category: fullName,
    });
  }

  // Also group items that had no known roman (if any)
  const unclassified = [];
  for (const q of questions) {
    const roman = (q.category || '').trim();
    if (!ROMAN_TO_CATEGORY[roman]) {
      unclassified.push({ ...q, category: 'UNCLASSIFIED' });
    }
  }
  if (unclassified.length) {
    grouped.set('UNCLASSIFIED', { fullName: 'UNCLASSIFIED', list: unclassified });
  }

  // Write one file per group
  for (const [roman, { fullName, list }] of grouped.entries()) {
    const fileName =
      roman === 'UNCLASSIFIED'
        ? 'UNCLASSIFIED.cjs'
        : slugifyFileName(roman, fullName);

    const filePath = path.join(outDir, fileName);
    const header = `// ${roman} ${fullName}\n\nmodule.exports = `;
    fs.writeFileSync(filePath, header + JSON.stringify(list, null, 2) + ';\n', 'utf8');
    console.log(`Wrote ${list.length} questions to ${filePath}`);
  }
}

main();