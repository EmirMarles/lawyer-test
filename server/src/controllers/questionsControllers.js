import { getRandomQuestions } from '../data/loadQuestions.js'
import { calculateGrade } from '../utils/gradeCalculation.js'
import { createSession, getSession, deleteSession } from '../utils/sessions.js'

export const getQuestions = async (req, res) => {
    try {
        const allQuestions = getRandomQuestions(100);

        const questionsForClient = allQuestions.map(({ questionId, questionText, options }) => ({
            questionId,
            questionText,
            options,
        }));

        const sessionId = createSession(allQuestions);

        res.status(200).json({
            sessionId,
            questions: questionsForClient,
        });
    } catch (err) {
        console.error('Error getting questions!', err);
        res.status(500).json({ message: err.message });
    }
};

export const checkAnswers = async (req, res) => {
    try {
        const { sessionId, answers } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        if (!answers || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No answers provided',
            });
        }

        const session = getSession(sessionId);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired session',
            });
        }

        const checkQuestions = session.questions;
        deleteSession(sessionId);

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
