import { useEffect, useState } from 'react'
import Login from './components/Login'
import Upload from './components/Upload'
import Library from './components/Library'
import Dashboard from './components/Dashboard'
import QuizPicker from './components/QuizPicker'
import ModeSelect from './components/ModeSelect'
import PracticeQuiz from './components/PracticeQuiz'
import TestQuiz from './components/TestQuiz'
import Results from './components/Results'
import { getToken, fetchMe, logout as apiLogout } from './api/auth'

export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // 'upload' | 'library' | 'dashboard' | 'pick' | 'select' | 'practice' | 'test' | 'results'
  const [screen, setScreen] = useState('upload')
  const [quizSets, setQuizSets] = useState(null)
  const [quizSet, setQuizSet] = useState(null)
  const [activeMode, setActiveMode] = useState(null) // 'practice' | 'test'
  const [testConfig, setTestConfig] = useState(null)
  const [result, setResult] = useState(null)

  // Restore a session from a stored token on first load.
  useEffect(() => {
    if (!getToken()) {
      setAuthChecked(true)
      return
    }
    fetchMe()
      .then(setUser)
      .catch(() => apiLogout())
      .finally(() => setAuthChecked(true))
  }, [])

  function handleLogout() {
    apiLogout()
    setUser(null)
    setScreen('upload')
    setQuizSet(null)
    setQuizSets(null)
    setResult(null)
  }

  function onLoaded(data) {
    setQuizSets(data.quizSets)
    if (data.quizSets.length === 1) {
      setQuizSet(data.quizSets[0])
      setScreen('select')
    } else {
      setScreen('pick')
    }
  }

  function onLibraryPick(fullQuizSet) {
    setQuizSet(fullQuizSet)
    setScreen('select')
  }

  function pickQuiz(index) {
    setQuizSet(quizSets[index])
    setScreen('select')
  }

  function start({ mode, clock, durationSeconds }) {
    setActiveMode(mode)
    if (mode === 'practice') {
      setScreen('practice')
    } else {
      setTestConfig({ clock, durationSeconds })
      setScreen('test')
    }
  }

  function finish({ answers, timeTakenSeconds }) {
    setResult({ answers, timeTakenSeconds })
    setScreen('results')
  }

  function retryQuiz() {
    setResult(null)
    setTestConfig(null)
    setScreen('select')
  }

  function retakeMistakes() {
    const wrongQuestions = quizSet.questions.filter((q, i) => result.answers[i] !== q.correctAnswer)
    if (wrongQuestions.length === 0) return
    setQuizSet({
      ...quizSet,
      questions: wrongQuestions,
      questionCount: wrongQuestions.length,
      title: `${quizSet.title} — mistakes`,
    })
    setResult(null)
    setTestConfig(null)
    setScreen('select')
  }

  function newQuiz() {
    setResult(null)
    setTestConfig(null)
    setQuizSet(null)
    setQuizSets(null)
    setScreen('upload')
  }

  function backToUpload() {
    setQuizSets(null)
    setScreen('upload')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-sm text-muted">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Login onAuthed={setUser} />
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-rule">
        <div className="max-w-xl mx-auto px-6 py-3 flex items-center justify-between text-sm text-muted">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="underline underline-offset-2 hover:text-ink">
            Log out
          </button>
        </div>
      </div>

      {screen === 'upload' && (
        <Upload
          onLoaded={onLoaded}
          onViewLibrary={() => setScreen('library')}
          onViewDashboard={() => setScreen('dashboard')}
        />
      )}

      {screen === 'library' && (
        <Library onPick={onLibraryPick} onBack={() => setScreen('upload')} />
      )}

      {screen === 'dashboard' && <Dashboard onBack={() => setScreen('upload')} />}

      {screen === 'pick' && (
        <QuizPicker quizSets={quizSets} onPick={pickQuiz} onBack={backToUpload} />
      )}

      {screen === 'select' && <ModeSelect quizSet={quizSet} onStart={start} />}

      {screen === 'practice' && (
        <PracticeQuiz questions={quizSet.questions} onFinish={finish} />
      )}

      {screen === 'test' && (
        <TestQuiz
          questions={quizSet.questions}
          clock={testConfig.clock}
          durationSeconds={testConfig.durationSeconds}
          onFinish={finish}
        />
      )}

      {screen === 'results' && (
        <Results
          quizSet={quizSet}
          questions={quizSet.questions}
          answers={result.answers}
          timeTakenSeconds={result.timeTakenSeconds}
          mode={activeMode}
          onRetry={retryQuiz}
          onNewQuiz={newQuiz}
          onRetakeMistakes={retakeMistakes}
        />
      )}
    </div>
  )
}
