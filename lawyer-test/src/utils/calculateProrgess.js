export function calculateProgress(arr) {
    if (arr === null || arr === undefined) return 0;
    const questionAmount = arr.length;
    const amountOfQuestionsAnswered = arr.filter(a => a !== null).length;
    const percentage = (amountOfQuestionsAnswered / questionAmount) * 100;
    return Math.floor(percentage);
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