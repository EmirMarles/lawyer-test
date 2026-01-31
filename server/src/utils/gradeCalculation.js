export function calculateGrade(incorrectAnswers, totalQuestions = 100) {
    const correctAnswers = totalQuestions - incorrectAnswers;
    const percentage = (correctAnswers / totalQuestions) * 100;
    return Math.floor(percentage);
}