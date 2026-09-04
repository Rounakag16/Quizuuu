import { useEffect, useRef, useState } from 'react'
import { formatTime } from '../hooks/useClock'
import { saveAttempt } from '../api/attempts'

export default function Results({ quizSet, questions, answers, timeTakenSeconds, mode, onRetry, onNewQuiz, onRetakeMistakes }) {
  const total = questions.length
  const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswer).length
  const scorePct = Math.round((correctCount / total) * 100)
  const wrongCount = total - correctCount

  const savedRef = useRef(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    // Guard against double-firing (e.g. React StrictMode) and skip quizzes
    // that were never persisted (the "try the sample quiz" shortcut has no _id).
    if (savedRef.current || !quizSet._id) return
    savedRef.current = true

    const attempt = {
      quizSetId: quizSet._id,
      quizTitle: quizSet.title,
      mode,
      timeTakenSeconds: typeof timeTakenSeconds === 'number' ? timeTakenSeconds : null,
      score: correctCount,
      total,
      answers: questions.map((q, i) => ({
        topic: q.topic,
        subtopic: q.subtopic,
        selected: answers[i] ?? null,
        correctAnswer: q.correctAnswer,
        isCorrect: answers[i] === q.correctAnswer,
      })),
    }

    saveAttempt(attempt).catch((err) => setSaveError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <p className="text-sm text-muted mb-1">Result</p>
      <h1 className="font-serif text-3xl mb-1">
        {correctCount} / {total} correct
      </h1>
      <p className="text-sm text-muted mb-2">
        {scorePct}%{typeof timeTakenSeconds === 'number' ? ` · ${formatTime(timeTakenSeconds)} taken` : ''}
      </p>
      {!quizSet._id && (
        <p className="text-xs text-muted mb-8">This was the unsaved sample quiz, so this attempt wasn't recorded.</p>
      )}
      {saveError && (
        <p className="text-xs text-incorrect mb-8">Couldn't record this attempt — {saveError}.</p>
      )}

      <div className="space-y-6 mt-8">
        {questions.map((q, i) => {
          const userAnswer = answers[i]
          const isCorrect = userAnswer === q.correctAnswer
          const wasAnswered = userAnswer !== undefined

          return (
            <div key={i} className="border-t border-rule pt-5">
              <p className="text-xs text-muted mb-1">
                Question {i + 1} &middot; {q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}
              </p>
              <p className="font-serif text-base leading-relaxed mb-3">{q.question}</p>

              <div className="space-y-2">
                {Object.entries(q.options).map(([letter, text]) => {
                  const isCorrectOption = letter === q.correctAnswer
                  const isUserChoice = letter === userAnswer

                  let stateClasses = 'border-rule'
                  if (isCorrectOption) stateClasses = 'border-correct bg-correct-bg'
                  else if (isUserChoice) stateClasses = 'border-incorrect bg-incorrect-bg'

                  return (
                    <div key={letter} className={`border p-3 ${stateClasses}`}>
                      <div className="flex gap-3">
                        <span className="text-sm font-medium text-muted">{letter}</span>
                        <span className="text-sm">{text}</span>
                      </div>
                      {(isCorrectOption || isUserChoice) && (
                        <p className={`text-sm mt-1.5 ${isCorrectOption ? 'text-correct' : 'text-incorrect'}`}>
                          {q.explanations[letter]}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {!wasAnswered && (
                <p className="text-sm text-muted mt-2">Not answered.</p>
              )}
              {wasAnswered && !isCorrect && null}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-10">
        <button
          onClick={onRetry}
          className="bg-ink text-paper px-5 py-2.5 text-sm font-medium"
        >
          Retry this quiz
        </button>
        {wrongCount > 0 && (
          <button
            onClick={onRetakeMistakes}
            className="border border-incorrect text-incorrect px-5 py-2.5 text-sm font-medium"
          >
            Retake {wrongCount} mistake{wrongCount > 1 ? 's' : ''} only
          </button>
        )}
        <button
          onClick={onNewQuiz}
          className="border border-ink px-5 py-2.5 text-sm font-medium"
        >
          Load a different quiz
        </button>
      </div>
    </div>
  )
}
