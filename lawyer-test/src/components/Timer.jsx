import { useEffect } from 'react'
import './Timer.css'
import { useState } from 'react'

export default function Timer({ timerBool }) {

    const [countdown, setCountdown] = useState(90)

    useEffect(()=>{
        const interval = setInterval(()=>{
            setCountdown(countdown=> countdown - 1)
        }, 1000)

        // return clearInterval(interval)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='timer-component'>
            <div className="countdown">Timer: {countdown}</div>
        </div>
    )
}