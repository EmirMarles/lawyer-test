import { randomUUID } from 'crypto';
import { getRandomQuestions } from '../data/loadQuestions.js'
import { calculateGrade } from '../utils/gradeCalculation.js'
import { createAnswerToken, verifyAnswerToken } from '../utils/answerToken.js'

export const getQuestions = async (req, res) => {
    try {
        const allQuestions = getRandomQuestions(100);

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
