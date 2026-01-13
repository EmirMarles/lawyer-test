import './IncorrectQuestion.css'
import { useEffect } from 'react'

export function IncorrectOption({ option, incorrectOption, correctAnswer }) {

    if (option === incorrectOption) {
        return (
            <li className="incorrect-option">{incorrectOption}</li>)
    }
    else if (option === correctAnswer) {
        return (
            <li className="correct-option">{correctAnswer}</li>
        )
    }
    else {
        return (
            <li className='option'>
                {option}
            </li >)
    }
}