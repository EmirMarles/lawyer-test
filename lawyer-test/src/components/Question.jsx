import { useState, useEffect } from 'react'
import './Question.css'
import { QuestionOptions } from './QuestionOption'

// each TestPage has its own 
// INDEXES with questions, and each question option has its own INDEXES of question options  
export function Question({
    question,
    arrayOfAnswers,
    setArrayOfAnswers,
    globalIndex,
    // setProgressBarValue
}) {
    const [chosenOption, setChosenOption] = useState(null)

    // SETTING THE CHOSEN OPTION FROM THE LOCAL STORAGE //

    useEffect(() => {
        const getLocalAnswers = () => {
            const storageAnswers = arrayOfAnswers;
            const chosenOpt = storageAnswers[globalIndex]
            if (chosenOpt !== null && chosenOpt !== undefined) {
                // console.log('SETTING CHOSEN OPTION:', chosenOpt)
                setChosenOption(chosenOpt)
            } else {
                setChosenOption(null)
                console.log('NULL OR UNDEFINED:', chosenOpt)
            }
        }
        getLocalAnswers();
    }, [])


    // UPDATING THE STATE OF ANSWERS //

    useEffect(() => {
        if (globalIndex === null || chosenOption === null) return;
        setArrayOfAnswers(prev => {
            if (prev[globalIndex] === chosenOption) return prev
            const updated = [...prev]
            updated[globalIndex] = chosenOption
            return updated
        })
    }, [chosenOption, globalIndex])

    return (
        <div className="question-component">
            <h4 className="question-text">{globalIndex}. {question.questionText}</h4>
            <ul className="question-options">
                {question.options.map((option, index) => {
                    return <QuestionOptions
                        key={index}
                        index={index}
                        chosenOption={chosenOption}
                        setChosenOption={setChosenOption}
                        option={option}
                    // new prop to set each to false
                    > </QuestionOptions>
                })}
            </ul>
        </div>
    )
}