import './ResultsPage.css'
import { returnIncorrectAnswers } from '../utils/returnIncorrectAnswers'
import { useEffect, useState } from 'react'
import { IncorrectQuestion } from '../components/IncorrectQuestion'
import { useNavigate } from 'react-router-dom'

export function ResultsPage({ answers }) {

    // MAKE THE ANSWERS PRETTY ON FIRST LOAD // 
    const [incorrectAnswers, setIncorrectAnswers] = useState(() => {
        return JSON.parse(localStorage.getItem('incorrectAnswers')) || null
    })
    const [score, setScore] = useState(() => {
        return JSON.parse(localStorage.getItem('score')) || null
    })
    const [err, setErr] = useState(false)
    const [loadPage, setLoadPage] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        console.log('answers saved in state:', answers)
        const getIncorrectAnswers = () => {
            if (!answers) {
                setErr(true)
                return
            }
            setScore(answers.grade)
            localStorage.setItem('score', JSON.stringify(answers.grade))
            const prettyAnswers = returnIncorrectAnswers(answers)
            console.log('arr to return', prettyAnswers)
            setIncorrectAnswers(prettyAnswers)
            // saving to local storage
            localStorage.setItem('incorrectAnswers', JSON.stringify(prettyAnswers))
        }
        getIncorrectAnswers();
    }, [answers])

    const handleStartOver = () => {
        localStorage.removeItem('answers')
        navigate('/')
        return
    }
    // need to retrieve incorrect questions from the main questions state

    if (err) {
        return (
            <div className="results-page-layout">
                <div className="results-section">
                    <div className='results-error'>Error!</div>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="results-page-layout">
                <div className="results-section">
                    <div className="results">
                        <h1>Results! </h1>
                        <button className='start-over' onClick={handleStartOver}>Start Over</button>
                    </div>

                    <div className="score"><span className='percentage'>{score}%</span> out of 100%</div>
                    <h4 className="incorrect">Incorrect Answers:</h4>
                    <div className="incorrect-answers">
                        {incorrectAnswers && incorrectAnswers.map((incorrectAnswer, index) => {
                            return (<IncorrectQuestion
                                key={incorrectAnswer.questionId}
                                incorrectAnswer={incorrectAnswer}
                                index={index}
                            ></IncorrectQuestion>)
                        })}
                    </div>
                </div>
            </div>
        )
    }
}