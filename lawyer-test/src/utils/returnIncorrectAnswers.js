export function returnIncorrectAnswers(arrOfObjects) {
    if (!arrOfObjects) return null;

    const arr = arrOfObjects.checkedAnswers;
    if (!arr || arr.length === 0) return [];

    return arr
        .filter(item => item.isCorrect === false)
        .map(item => ({
            questionId: item.questionId,
            correctAnswer: item.correctAnswer,
            options: item.options || [],
            questionText: item.questionText || '',
            incorrectOption: item.incorrectAnswer
        }));
}