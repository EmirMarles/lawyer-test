import './HomePage.css'
import { useNavigate } from 'react-router-dom'

export function HomePage() {

    const navigate = useNavigate()

    const handleStart = () =>{
        navigate('/main-test-page')
    }
    
    return (
        <div className="home-page">
            <div className='home-layout'>
                <div className="test-header">Welcome to Lawyer Test!</div>
                <button className="start-test" onClick={handleStart}>Start Test!</button>
            </div>
        </div>

    )
}