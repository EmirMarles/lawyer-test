import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use judge questions (from project root) for the test. .cjs so require() works with "type": "module".
const judgeQuestionsPath = path.join(__dirname, '../../../judge-questions.cjs');
const questions = require(judgeQuestionsPath);

export function getAllQuestions() {
    return questions;
}

export function getRandomQuestions(count = 100) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
