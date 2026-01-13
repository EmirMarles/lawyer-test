import './App.css'
import MainTestPage from './pages/MainTestPage'
import { HomePage } from './pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ResultsPage } from './pages/ResultsPage'
import { useState } from 'react'
import { useEffect } from 'react'

function App() {

  const [answers, setAnswers] = useState(()=>{
    return (JSON.parse(localStorage.getItem('apiAnswer')) || null)
  })


  useEffect(() => {
    // saving answers locally 
    localStorage.setItem('apiAnswer', JSON.stringify(answers))
  }, [answers])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="main-test-page/*" element={<MainTestPage
          answers={answers}
          setAnswers={setAnswers}
        />}></Route>
        <Route path="results" element={< ResultsPage
          answers={answers}
        />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
