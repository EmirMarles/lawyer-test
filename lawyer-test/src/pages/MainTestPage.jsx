import { useEffect, useState } from "react"
import { TestPage } from "../components/TestPage"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { divideQuestions } from "../utils/arraysHelper"
import { calculateProgress } from "../utils/calculateProrgess"
import axios from 'axios'

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function MainTestPage({ setAnswers, timerBool }) {

    const [arrayOfArrays, setArrayOfArrays] = useState([null])
    const [sessionId, setSessionId] = useState(null)
    const [answerToken, setAnswerToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timerCountdown, setTimerCountdown] = useState(90)
    const [arrayOfAnswers, setArrayOfAnswers] = useState(() => {
        const arrAnswers = localStorage.getItem('answers')
        return arrAnswers !== null ? JSON.parse(arrAnswers) : new Array(100).fill(null)
    })
    const [progressBarValue, setProgressBarValue] = useState(() => {
        const stored = localStorage.getItem('progressbar')
        return stored !== null ? JSON.parse(stored) : 0
    })
    // const [hydrated, setHydrated] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const categoryKey = location.state?.categoryKey || null;

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

    // GETTING QUESTIONS FROM API (all categories or specific category)
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${apiUrl}/api/questions/getQuestions`);
                const { sessionId: sid, questions, answerToken: token } = response.data;
                setSessionId(sid);
                setAnswerToken(token);
                if (token) sessionStorage.setItem('answerToken', token);
                if (sid) sessionStorage.setItem('sessionId', sid);
                const arrayOfQuestions = divideQuestions(questions);
                setArrayOfArrays(arrayOfQuestions);
                localStorage.removeItem('answers');
                localStorage.removeItem('progressbar');
                setArrayOfAnswers(new Array(100).fill(null));
                navigate('test-page1');
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to load questions. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategory = async () => {
            try {
                console.log('fetching category questions:', categoryKey)
                setLoading(true);
                setError(null);
                const response = await axios.get(`${apiUrl}/api/questions/by-category`, {
                    params: { categoryKey }
                });
                const { questions, sessionId: sid, answerToken: token } = response.data;
                setSessionId(sid || null);
                setAnswerToken(token || null);
                if (token) sessionStorage.setItem('answerToken', token);
                if (sid) sessionStorage.setItem('sessionId', sid);
                const arrayOfQuestions = divideQuestions(questions);
                setArrayOfArrays(arrayOfQuestions);
                localStorage.removeItem('answers');
                localStorage.removeItem('progressbar');
                setArrayOfAnswers(new Array(100).fill(null));
                navigate('/main-test-page/test-page1');
            } catch (err) {
                console.error('Error fetching category questions:', err);
                const msg = err.response?.data?.message || 'Failed to load category questions';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        if (categoryKey) {
            fetchCategory();
        } else {
            fetchAll();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryKey]);

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
                timerBool: timerBool,
                sessionId,
                answerToken,
                categoryKey: categoryKey
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
                timerBool: timerBool,
                sessionId,
                answerToken,
                categoryKey: categoryKey
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
                timerBool: timerBool,
                sessionId,
                answerToken,
                categoryKey: categoryKey
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
                timerBool: timerBool,
                sessionId: sessionId,
                answerToken: answerToken,
                categoryKey: categoryKey
            },
        }
    ]

    if (loading) {
        return <div className="loading-screen">Loading questions...</div>;
    }
    if (error) {
        return <div className="error-screen">{error}</div>;
    }

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