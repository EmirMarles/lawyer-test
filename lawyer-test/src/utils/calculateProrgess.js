export function calculateProgress(arr) {

    if (arr === null && arr === undefined) {
        return
    }
    const questionAmount = 92
    let amountOfQuestionsAnswered = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== null) {
            amountOfQuestionsAnswered++
        }
    }
    let percentage = (amountOfQuestionsAnswered / questionAmount) * 100
    let rounded = Math.floor(percentage)
    return rounded
}

let answers = [
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3'
];

let notFullAnswers = [
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0', '1', '2', '3',
    '0', '1', '2', '3', '0', '1', '2', '3', '0'
];

console.log('another result:', calculateProgress(notFullAnswers))
console.log('resulst:', calculateProgress(answers))