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
import { getPublicQuizSet } from './api/publicQuizSets'
import { initAnalytics, trackPageView, trackEvent } from './lib/analytics'

export default function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // A ?shared=<token> URL bypasses login entirely — read once on mount.
  const [sharedToken] = useState(() => new URLSearchParams(window.location.search).get('shared'))
  const [sharedError, setSharedError] = useState(null)

  // 'upload' | 'library' | 'dashboard' | 'pick' | 'select' | 'practice' | 'test' | 'results'
  const [screen, setScreen] = useState('upload')
  const [quizSets, setQuizSets] = useState(null)
  const [quizSet, setQuizSet] = useState(null)
  const [activeMode, setActiveMode] = useState(null) // 'practice' | 'test'
  const [testConfig, setTestConfig] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    initAnalytics()
  }, [])

  // No client-side router (single-page state machine), so a screen change
  // is the closest equivalent to a page view — track it whenever it changes.
  useEffect(() => {
    trackPageView(screen)
  }, [screen])

  // Shared-link flow: fetch the public quiz set and jump straight to mode select.
  useEffect(() => {
    if (!sharedToken) return
    getPublicQuizSet(sharedToken)
      .then((qs) => {
        setQuizSet({ ...qs, shared: true })
        setScreen('select')
        trackEvent('shared_quiz_viewed', { quiz_title: qs.title })
      })
      .catch((err) => setSharedError(err.message))
  }, [sharedToken])

  // Restore a session from a stored token on first load (skipped entirely
  // for the shared-link flow, which never needs a login).
  useEffect(() => {
    if (sharedToken) return
    if (!getToken()) {
      setAuthChecked(true)
      return
    }
    fetchMe()
      .then(setUser)
      .catch(() => apiLogout())
      .finally(() => setAuthChecked(true))
  }, [sharedToken])

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
    trackEvent('quiz_started', { mode, quiz_title: quizSet?.title, question_count: quizSet?.questions?.length })
    if (mode === 'practice') {
      setScreen('practice')
    } else {
      setTestConfig({ clock, durationSeconds })
      setScreen('test')
    }
  }

  function finish({ answers, timeTakenSeconds }) {
    const total = quizSet.questions.length
    const correct = quizSet.questions.filter((q, i) => answers[i] === q.correctAnswer).length
    trackEvent('quiz_completed', { mode: activeMode, score: correct, total, quiz_title: quizSet.title })
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
    trackEvent('retake_mistakes_started', { quiz_title: quizSet.title, mistake_count: wrongQuestions.length })
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

  if (sharedToken) {
    if (sharedError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center px-6 text-center text-sm text-incorrect">
          Couldn't load this shared quiz — {sharedError}.
        </div>
      )
    }
    if (!quizSet) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center text-sm text-muted">
          Loading shared quiz…
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-paper">
        <div className="border-b border-rule">
          <div className="max-w-xl mx-auto px-6 py-3 text-sm text-muted">
            Shared quiz &middot; viewing without an account, so this attempt won't be saved.
          </div>
        </div>

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
            onRetakeMistakes={retakeMistakes}
            onNewQuiz={() => {
              window.location.href = window.location.origin + window.location.pathname
            }}
          />
        )}
      </div>
    )
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
