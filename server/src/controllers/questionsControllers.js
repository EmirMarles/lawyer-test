import { questions } from '../consts/questions.js'
import { calculateGrade } from '../utils/gradeCalculation.js'

export const getQuestions = async (req, res) => {
    try {
        const quests = questions
        res.status(200).json(quests)
    } catch (err) {
        console.error('Error getting questions!', err)
        res.status(500).json({ message: err })
    }
}   

export const checkAnswers = async (req, res) => {
    try {
        const { answers } = req.body
        const checkQuestions = questions

        if (!answers || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "no answers!"
            })
        }

        let finalArray = []

        // calculation for percentage / grade

        let incorrectAnswers = 0

        for (let i = 0; i < answers.length; i++) {
            if (Number(answers[i]) === checkQuestions[i].correctAnswerIndex) {
                finalArray[i] = {
                    questionId: checkQuestions[i].questionId,
                    isCorrect: true,
                    correctAnswer: null,
                    incorrectAnswer: null
                }
            } else {
                finalArray[i] = {
                    questionId: checkQuestions[i].questionId,
                    isCorrect: false,
                    correctAnswer: checkQuestions[i].correctAnswer,
                    incorrectAnswer: checkQuestions[i].options[Number(answers[i])]
                }
                incorrectAnswers++;
            }
        }

        // 3 incorrect answers out of 92
        const grade = calculateGrade(incorrectAnswers)

        // const obj = {
        //     grade: grade,
        //     checkedAnswers: finalArray
        // }
        // console.log(obj)

        res.status(200).json({
            success: true,
            grade: grade,
            checkedAnswers: finalArray
        })

    } catch (err) {
        console.error('error!', err)
        res.status(500).json({ message: "error" })
    }
}