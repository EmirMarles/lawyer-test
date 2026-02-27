import { randomUUID } from 'crypto';
import { calculateGrade } from '../utils/gradeCalculation.js'
import { createAnswerToken, verifyAnswerToken } from '../utils/answerToken.js'
import { connectDB } from '../db.js';

// 1) Get N random questions from all categories (default 100), from MongoDB
export const getQuestions = async (req, res) => {
    try {
        const count = Number(req.query.count) || 100;

        const db = await connectDB();
        const collection = db.collection('questions');

        const allQuestions = await collection
            .aggregate([{ $sample: { size: count } }])
            .toArray();

        if (!allQuestions.length) {
            return res.status(404).json({ message: 'No questions found in database' });
        }

        const questionsForClient = allQuestions.map(({ questionId, questionText, options }) => ({
            questionId,
            questionText,
            options,
        }));

        const sessionId = randomUUID();
        const answerToken = createAnswerToken(sessionId, allQuestions);

        res.status(200).json({
            sessionId,
            questions: questionsForClient,
            answerToken,
        });
    } catch (err) {
        console.error('Error getting questions!', err);
        res.status(500).json({ message: err.message });
    }
};

// 2) Get all questions for a given categoryKey (e.g. "I.", "II.", "UNCLASSIFIED") from MongoDB
export const getQuestionsByCategory = async (req, res) => {
    try {
        const { categoryKey } = req.query;

        if (!categoryKey) {
            return res.status(400).json({
                success: false,
                message: 'categoryKey query parameter is required (e.g. "I.", "II.", "UNCLASSIFIED")',
            });
        }

        const db = await connectDB();
        const collection = db.collection('questions');

        const docs = await collection
            .find({ categoryKey })
            .sort({ questionId: 1 })
            .toArray();

        if (!docs.length) {
            return res.status(404).json({
                success: false,
                message: `No questions found for categoryKey "${categoryKey}"`,
            });
        }

        const questionsForClient = docs.map(({ questionId, questionText, options }) => ({
            questionId,
            questionText,
            options,
        }));

        res.status(200).json({
            success: true,
            categoryKey,
            categoryName: docs[0].categoryName,
            count: docs.length,
            questions: questionsForClient,
        });
    } catch (err) {
        console.error('Error getting questions by category!', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const checkAnswers = async (req, res) => {
    try {
        const { sessionId, answers, answerToken } = req.body;

        if (!answerToken) {
            return res.status(400).json({
                success: false,
                message: 'Answer token is required. Please start a new test if you lost your session.',
            });
        }

        if (!answers || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No answers provided',
            });
        }

        const payload = verifyAnswerToken(answerToken);
        if (!payload) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired session. Please start a new test.',
            });
        }

        if (sessionId && payload.sessionId !== sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session mismatch. Please start a new test.',
            });
        }

        const checkQuestions = payload.questions;

        if (answers.length !== checkQuestions.length) {
            return res.status(400).json({
                success: false,
                message: `Expected ${checkQuestions.length} answers, got ${answers.length}`,
            });
        }

        const finalArray = [];
        let incorrectCount = 0;

        for (let i = 0; i < answers.length; i++) {
            const userAnswerIndex = Number(answers[i]);
            const correctIndex = checkQuestions[i].correctAnswerIndex;

            if (userAnswerIndex === correctIndex) {
                finalArray.push({
                    questionId: checkQuestions[i].questionId,
                    isCorrect: true,
                    correctAnswer: null,
                    incorrectAnswer: null,
                });
            } else {
                const userAnswer = Number.isNaN(userAnswerIndex) || userAnswerIndex < 0 || userAnswerIndex >= checkQuestions[i].options.length
                    ? null
                    : checkQuestions[i].options[userAnswerIndex];

                finalArray.push({
                    questionId: checkQuestions[i].questionId,
                    isCorrect: false,
                    correctAnswer: checkQuestions[i].correctAnswer,
                    incorrectAnswer: userAnswer,
                    questionText: checkQuestions[i].questionText,
                    options: checkQuestions[i].options,
                });
                incorrectCount++;
            }
        }

        const grade = calculateGrade(incorrectCount, checkQuestions.length);

        res.status(200).json({
            success: true,
            grade,
            checkedAnswers: finalArray,
        });
    } catch (err) {
        console.error('Error checking answers:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
