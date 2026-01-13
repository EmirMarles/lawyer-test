import { questions } from "../constants/questions";
import { answers } from "../constants/answers";


const ids = [2, 3, 1, 7]


// return an array of incorrect questions and correct answers
const obj = {
    questionId: 1,
    options: [
        "Physical ID card",
        "Online representation of an individual",
        "Court record",
        "Legal right"
    ],
    correctAnswer: "Online representation of an individual",
    incorrectAnswers: "something something"
}

export function getIncorrectQuestions(questions, answers) {
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].questionId === answers[i].questionId)
    }
}