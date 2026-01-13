export function calculateGrade(incorrectAnswers) {
    const totalQuestions = 92;
    let correctAnswers = totalQuestions - incorrectAnswers
    let percentage = ((correctAnswers / totalQuestions) * 100)

    return Math.floor(percentage)
}