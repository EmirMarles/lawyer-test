import './QuestionOption.css'
import { useState, useEffect } from 'react'

export function QuestionOptions({ index, chosenOption, setChosenOption, option }) {

    const [isChosen, setIsChosen] = useState(false)

    const handleClick = () => {
        if (isChosen) {
            setIsChosen(false)
            setChosenOption(null)
        }
        else if (!isChosen) {
            setIsChosen(true)
            setChosenOption(`${index}`)
        }
    }

    useEffect(() => {
        const setFalse = () => {
            setIsChosen(false)
        }
        const setTrue = () => {
            setIsChosen(true)
        }
        if (chosenOption === null){
            setFalse()
            return 
        }
        else if ((Number(chosenOption)) !== index) {
            setFalse();
            return 
        }
        else if (Number(chosenOption) === Number(index)) {
            setTrue();
            return; 
        }
    }, [chosenOption])

    if (isChosen) {
        return (<li
            className='option-chosen'
            onClick={handleClick}
            style={{ textDecoration: "line-through" }}
        > {option}
        </li >)
    }

    if (!isChosen) {
        return (<li
            className='option'
            onClick={handleClick}
        > {option}
        </li >)
    }
}