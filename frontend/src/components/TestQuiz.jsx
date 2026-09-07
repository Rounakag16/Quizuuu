import { useState, useCallback } from 'react'
import { useClock } from '../hooks/useClock'
import ClockDisplay from './ClockDisplay'
import QuestionNav from './QuestionNav'

export default function TestQuiz({ questions, clock, durationSeconds, onFinish }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const submit = useCallback(
    (timeTakenSeconds) => {
      onFinish({ answers, timeTakenSeconds })
    },
    [answers, onFinish],
  )

  const { elapsed, remaining } = useClock({
    mode: clock,
    durationSeconds,
    onExpire: () => submit(durationSeconds),
  })

  const question = questions[index]
  const isLast = index === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const answeredIndices = new Set(Object.keys(answers).map(Number))

  function select(letter) {
    setAnswers((prev) => ({ ...prev, [index]: letter }))
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between text-xs text-muted mb-6">
        <span>Question {index + 1} of {questions.length} &middot; {answeredCount} answered</span>
        <ClockDisplay mode={clock} elapsed={elapsed} remaining={remaining} />
      </div>

      <QuestionNav
        total={questions.length}
        currentIndex={index}
        answeredIndices={answeredIndices}
        onJump={setIndex}
      />

      <h2 className="font-serif text-xl leading-relaxed mb-6">{question.question}</h2>

      <div className="space-y-2">
        {Object.entries(question.options).map(([letter, text]) => (
          <button
            key={letter}
            onClick={() => select(letter)}
            className={`w-full text-left border p-3.5 flex gap-3 ${
              answers[index] === letter ? 'border-accent bg-white' : 'border-rule hover:border-ink'
            }`}
          >
            <span className="text-sm font-medium text-muted">{letter}</span>
            <span className="text-sm">{text}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="text-sm text-muted disabled:opacity-30"
        >
          &larr; Previous
        </button>

        {isLast ? (
          <button
            onClick={() => submit(elapsed)}
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium"
          >
            Submit test
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </div>
  )
}
