import './App.css'
import MainTestPage from './pages/MainTestPage'
import { HomePage } from './pages/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ResultsPage } from './pages/ResultsPage'
import { useState } from 'react'
import { useEffect } from 'react'
import { CATEGORIES } from './const/categories.js'

function App() {

  const [answers, setAnswers] = useState(() => {
    return (JSON.parse(localStorage.getItem('apiAnswer')) || null)
  })

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].key);

  const [timerBool, setTimerBool] = useState(false)

  useEffect(() => {
    // saving results locally from an API
    localStorage.setItem('apiAnswer', JSON.stringify(answers))
  }, [answers])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage 
        setTimerBool={setTimerBool} 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        />}></Route>
        <Route path="main-test-page/*" element={<MainTestPage
          answers={answers}
          setAnswers={setAnswers}
          timerBool={timerBool}
        />}></Route>
        <Route path="results" element={< ResultsPage
          answers={answers}
          setTimerBool={setTimerBool}
        />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
