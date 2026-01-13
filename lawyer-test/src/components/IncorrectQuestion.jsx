import './IncorrectQuestion.css'
import { IncorrectOption } from './IncorrectOption'

export function IncorrectQuestion({ incorrectAnswer, index }) {

    // {
    //         questionId: 6,
    //         correctAnswer: 'Information proving facts in court',
    //             options: [
    //                 'Legal advice',
    //                 'Information proving facts in court',
    //                 'A court decision',
    //                 'A witness opinion'
    //             ],
    //          questionText: 'What is evidence?',
    //          incorrectOption: 'Legal advice'
    // },
    return (
        <div className="question-component">
            <h4 className="question-text">{index + 1}. {incorrectAnswer.questionText}</h4>
            <ul className="question-options">
                {incorrectAnswer.options.map((option, index) => {
                    return <IncorrectOption
                        key={index}
                        option={option}
                        correctAnswer={incorrectAnswer.correctAnswer}
                        incorrectOption={incorrectAnswer.incorrectOption}
                    ></IncorrectOption>
                })}
            </ul>
        </div>
    )
}