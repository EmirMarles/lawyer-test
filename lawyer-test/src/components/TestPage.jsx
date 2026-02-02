import { useEffect, useState, useRef } from "react"
import { Question } from "./Question"
import './TestPage.css'
import { useNavigate } from "react-router-dom"
import Timer from "./Timer"
import { hasAllAnswers } from "../utils/hasAnswers"
import axios from 'axios'

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function TestPage({ timerCountdown,
    setTimerCountdown,
    pageIndex,
    questions,
    arrayOfAnswers,
    setArrayOfAnswers,
    setAnswers,
    progressBarValue,
    setProgressBarValue,
    timerBool,
    sessionId,
    answerToken
}) {
    const navigate = useNavigate()
    const [showPopUp, setShowPopUp] = useState(false)
    const endRef = useRef(null)
    const chunkSize = 25
    const pageQuestionIndex = pageIndex * chunkSize


    const movePage = () => {
        if (pageIndex < 4) {
            navigate(`/main-test-page/test-page${pageIndex + 2}`)
            window.scrollTo({
                top: 0,
                left: 0,
            })
        }
    }

    const movePageBack = () => {
        console.log('MOVING BACK index: ', pageIndex)
        if (pageIndex > 0) {
            navigate(`/main-test-page/test-page${(pageIndex + 1) - 1}`)
            window.scrollTo({
                top: 0,
                left: 0,
            })
        }
    }

    const handleSubmit = () => {

        const object = hasAllAnswers(arrayOfAnswers)
        if (!object) {
            console.error('error loading object!')
            return
        }

        if (object.hasAllAnswers) {
            console.log('submitting the results!')
        }

        if (!object.hasAllAnswers) {
            let index = object.index
            setShowPopUp(true)
            setTimeout(() => {
                setShowPopUp(false)
            }, 1500)
            console.log('the question at this index has no answers!', index)
            return
        }

        // SENDING THE ANSWERS TO THE BACKEND //

        const sendAnswers = async () => {
            try {
                const token = answerToken ?? sessionStorage.getItem('answerToken');
                const sid = sessionId ?? sessionStorage.getItem('sessionId');
                if (!token) {
                    alert('Session lost. Please go back and start a new test.');
                    return;
                }
                console.log('sending an API request')
                const response = await axios.post(`${apiUrl}/api/questions/checkAnswers`, {
                    sessionId: sid,
                    answers: arrayOfAnswers,
                    answerToken: token
                })
                console.log('response from an API:', response.data)
                setAnswers(response.data)
            }
            catch (err) {
                console.error(err)
            }
        }

        if (hasAllAnswers(arrayOfAnswers)) {
            sendAnswers();
            navigate('/results')
            window.scrollTo(0, 0)
        }
    }

    const setstate = () => {
        // setArrayOfAnswers(new Array(92).fill(null))
        // localStorage.removeItem('answers')
        return
    }

    const fillInTheQuestions = () => {
        const answers = Array.from({ length: 100 }, (_, i) => String(i % 4));
        setArrayOfAnswers(answers);
    }

    const handleScrollTop = () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }

    const handleScrollBottom = () => {
        endRef?.current.scrollIntoView({ behavior: 'smooth' })
    }

    if (questions === null || questions === undefined) {
        return (<div>There is a problem loading screen</div>)
    }

    return (
        <div className="test-page-layout">
            {/* <Timer timerBool={timerBool}></Timer> */}
            <button className="setStateAnswers" onClick={setstate}>Reset Answers</button>
            <button className="fillInTheQuestions" onClick={fillInTheQuestions}>Fill the questions in</button>
            <progress value={progressBarValue} max={100} className="progress-bar"></progress>
            <div className="header">Test Page <span className="number">{pageIndex + 1}</span></div>
            <div className="questions-grid">
                <button className="scroll-to-top" onClick={handleScrollTop}>Пролистать вверх</button>
                <div className="questions">
                    {questions.map((question, index) => {
                        const globalIndex = pageQuestionIndex + index
                        return (<Question
                            pageQuestionIndex={pageQuestionIndex}
                            key={question.questionId}
                            question={question}
                            globalIndex={globalIndex}
                            arrayOfAnswers={arrayOfAnswers}
                            setArrayOfAnswers={setArrayOfAnswers}
                            setProgressBarValue={setProgressBarValue}
                        />)
                    })}
                </div>
                {showPopUp &&
                    (<div className="popup">Please Fill in all the questions : {pageIndex}!</div>)}
                <button className="scroll-to-bottom" onClick={handleScrollBottom}>Пролистать вниз</button>
            </div>
            <div className="prev-next-button">
                <button className="prev" onClick={movePageBack}>Previous Page</button>
                {pageIndex === 3
                    ? (<button className="next" onClick={handleSubmit}> Submit </button>)
                    : (<button className="next" onClick={movePage}>Next Page </button>)
                }
            </div>
            <div className="empty" ref={endRef}></div>
        </div>)
}