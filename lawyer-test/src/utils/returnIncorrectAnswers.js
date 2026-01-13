// temp imports
import { questions } from "../constants/questions.js"
import { answers } from "../constants/answers.js"

function findQuestionOptions(arr, questionId) {

    let returnArr = {
        options: null,
        questionText: null
    }

    for (let i = 0; i < arr.length; i++) {
        if (Number(arr[i].questionId) === Number(questionId)) {
            returnArr.options = arr[i].options
            returnArr.questionText = arr[i].questionText
        }
    }

    return returnArr
}

export function returnIncorrectAnswers(arrOfObjects) {
    let arrToReturn = []

    if(!arrOfObjects){
        return null
    }

    const arr = arrOfObjects.checkedAnswers

    if (arr.length === 0 || arr.length < 0) {
        return
    }
    
    //     "questionId": 61,
    //     "isCorrect": false,
    //     "correctAnswer": "System of managing companies",
    //     "incorrectAnswer": "System of managing companies"
    // }

    let j = 0

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].isCorrect === false) {
            const options = findQuestionOptions(questions, arr[i].questionId)
            arrToReturn[j] = {
                questionId: arr[i].questionId,
                correctAnswer: arr[i].correctAnswer,
                options: options.options,
                questionText: options.questionText,
                incorrectOption: arr[i].incorrectAnswer
            }
            j++
        }
    }
    return arrToReturn
}



const print = returnIncorrectAnswers(answers)

console.log(print)