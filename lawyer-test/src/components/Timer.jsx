import './Timer.css'

export default function Timer({ timerCountdown, setTimerCountdown}) {
    return (
        <div className='timer-component'>
            <div className="countdown">Timer: {timerCountdown}</div>
        </div>
    )
}