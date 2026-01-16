import { useEffect, useState } from "react"
import { questions } from "../constants/questions"
import { TestPage } from "../components/TestPage"
import { Routes, Route, } from "react-router-dom"
import { divideQuestions } from "../utils/arraysHelper"
import { useNavigate } from "react-router-dom"
import { calculateProgress } from "../utils/calculateProrgess"

export default function MainTestPage({ setAnswers, timerBool }) {

    const [arrayOfArrays, setArrayOfArrays] = useState([null])
    const [timerCountdown, setTimerCountdown] = useState(90)
    const [arrayOfAnswers, setArrayOfAnswers] = useState(() => {
        const arrAnswers = localStorage.getItem('answers')
        return arrAnswers !== null ? JSON.parse(arrAnswers) : new Array(91).fill(null)
    })
    const [progressBarValue, setProgressBarValue] = useState(() => {
        const stored = localStorage.getItem('progressbar')
        return stored !== null ? JSON.parse(stored) : 0
    })
    // const [hydrated, setHydrated] = useState(false)
    const navigate = useNavigate()

    // SAVING THE ANSWERS //

    useEffect(() => {
        localStorage.setItem('answers', JSON.stringify(arrayOfAnswers))
        console.log('answers saved locally:', JSON.parse(localStorage.getItem('answers')))
    }, [arrayOfAnswers])


    // SETTING THE PROGRESS BAR //
    useEffect(() => {
        const setProgress = () => {
            const percentage = calculateProgress(arrayOfAnswers)
            setProgressBarValue(percentage)
            localStorage.setItem('progressbar', JSON.stringify(percentage))
        }
        setProgress();
    }, [arrayOfAnswers])

    // GETTING QUESTIONS FROM DB //

    useEffect(() => {
        let questionsFromDb = null
        const getQuestions = () => {
            questionsFromDb = questions
        }
        const saveArrayOfArrays = (arrayOfQuestions) => {
            setArrayOfArrays(arrayOfQuestions)
        }

        getQuestions();
        let arrayOfQuestions = divideQuestions(questionsFromDb)
        saveArrayOfArrays(arrayOfQuestions);
        if (arrayOfArrays) {
            navigate('test-page1')
        }
    }, [])

    // RAMPING UP THE TIMER

    const pagesData = [
        {
            path: '/test-page1',
            component: TestPage,
            pageId: 0,
            props: {
                title: "Test-page1",
                arrayOfAnswers: arrayOfAnswers,
                setArrayOfAnswers: setArrayOfAnswers,
                questions: arrayOfArrays[0],
                timerCountdown: timerCountdown,
                setTimerCountdown: setTimerCountdown,
                progressBarValue: progressBarValue,
                setProgressBarValue: setProgressBarValue,
                timerBool: timerBool
            },
        },
        {
            path: '/test-page2',
            pageId: 1,
            component: TestPage,
            props: {
                title: "Test-page2",
                arrayOfAnswers: arrayOfAnswers,
                setArrayOfAnswers: setArrayOfAnswers,
                questions: arrayOfArrays[1],
                timerCountdown: timerCountdown,
                setTimerCountdown: setTimerCountdown,
                progressBarValue: progressBarValue,
                setProgressBarValue: setProgressBarValue,
                timerBool: timerBool
            },
        },
        {
            path: '/test-page3',
            pageId: 2,
            component: TestPage,
            props: {
                title: "Test-page3",
                arrayOfAnswers: arrayOfAnswers,
                setArrayOfAnswers: setArrayOfAnswers,
                questions: arrayOfArrays[2],
                timerCountdown: timerCountdown,
                setTimerCountdown: setTimerCountdown,
                progressBarValue: progressBarValue,
                setProgressBarValue: setProgressBarValue,
                timerBool: timerBool
            },
        },
        {
            path: '/test-page4',
            component: TestPage,
            pageId: 3,
            props: {
                title: "Test-page4",
                arrayOfAnswers: arrayOfAnswers,
                setArrayOfAnswers: setArrayOfAnswers,
                questions: arrayOfArrays[3],
                timerCountdown: timerCountdown,
                setTimerCountdown: setTimerCountdown,
                setAnswers: setAnswers,
                progressBarValue: progressBarValue,
                setProgressBarValue: setProgressBarValue,
                timerBool: timerBool
            },
        }
    ]

    return (
        <>
            <Routes>
                {pagesData.map((Page) => {
                    const PageComponent = Page.component;
                    return (<Route
                        path={Page.path}
                        element={<PageComponent
                            {...Page.props}
                            pageIndex={Page.pageId} />}
                    >
                    </Route>)
                })
                }
            </Routes>
        </>)
}