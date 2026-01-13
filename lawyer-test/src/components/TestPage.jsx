import { useEffect, useState } from "react"
import { Question } from "./Question"
import './TestPage.css'
import { useNavigate } from "react-router-dom"
// import Timer from "./Timer"
import { hasAllAnswers } from "../utils/hasAnswers"
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL;

export function TestPage({ timerCountdown,
    setTimerCountdown,
    pageIndex,
    questions,
    arrayOfAnswers,
    setArrayOfAnswers,
    setAnswers
}) {

    const navigate = useNavigate()
    const [pageQuestionIndex, setPageQuestionIndex] = useState(0)
    const [showPopUp, setShowPopUp] = useState(false)

    useEffect(() => {
        const setPageIndex = (num) => {
            setPageQuestionIndex(num)
        }
        if (pageIndex === 0) {
            setPageIndex(0)
        }
        else if (pageIndex === 1) {
            setPageIndex(23)
        }
        else if (pageIndex === 2) {
            setPageIndex(46)
        }
        else {
            setPageIndex(69)
        }
    }, [pageIndex])


    const movePage = () => {
        if (pageIndex < 4) {
            navigate(`/main-test-page/test-page${pageIndex + 2}`)
        }
    }

    const movePageBack = () => {
        console.log('MOVING BACK index: ', pageIndex)
        if (pageIndex > 0) {
            navigate(`/main-test-page/test-page${(pageIndex + 1) - 1}`)
        }
    }

    if (questions === null || questions === undefined) {
        return (<div>There is a problem loading screen</div>)
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

        // sending the answers to the backend
        const sendAnswers = async () => {
            try {
                const answers = arrayOfAnswers
                console.log('sending an API request')
                const response = await axios.post(`${apiUrl}/api/questions/checkAnswers`, { answers })
                console.log('response from an API:', response.data)
                setAnswers(response.data)
                // WE SAVE THE RESPONSE TO THE STATE?
            }
            catch (err) {
                console.error(err)
            }
        }
        // HOW TO REDIRECT TO THE PAGE WITH THE DATA ON THE //

        if (hasAllAnswers(arrayOfAnswers)) {
            sendAnswers();
            navigate('/results')
        }
    }

    const setstate = () => {
        setArrayOfAnswers(new Array(92).fill(null))
        localStorage.removeItem('answers')
        return
    }

    const fillInTheQuestions = () =>{
        let newArr = [...arrayOfAnswers]
        newArr[22] = "2"
        newArr[45] = "2"
        newArr[68] = "3"
        newArr[91] = "3"
        setArrayOfAnswers(newArr)
        return 
    }

    return (
        <div className="test-page-layout">
            <button className="setStateAnswers" onClick={setstate}>Set State</button>
            <button className="fillInTheQuestions" onClick={fillInTheQuestions}>Fill the questions</button>
            {/* <button onClick={setTimer}>set timer</button> */}
            {/* <Timer timerCountdown={timerCountdown} setTimerCountdown={setTimerCountdown}></Timer> */}
            <div className="header">This is the test page!</div>
            <div className="questions-grid">
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
                        />)
                    })}
                </div>
                {showPopUp &&
                    (<div className="popup">Please Fill in all the questions : {pageIndex}!</div>)}
                <div className="prev-next-button">
                    <button className="prev" onClick={movePageBack}>Previous Page</button>
                    {pageIndex === 3
                        ? (<button className="nex" onClick={handleSubmit}> Submit </button>)
                        : (<button className="next" onClick={movePage}>Next Page </button>)
                    }
                </div>
            </div>
        </div>)
}