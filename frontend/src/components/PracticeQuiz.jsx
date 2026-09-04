import { useState } from 'react'

export default function PracticeQuiz({ questions, onFinish }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const question = questions[index]
  const isLast = index === questions.length - 1
  const selected = answers[index] ?? null
  const hasAnswered = selected !== null
  const answeredCount = Object.keys(answers).length

  function choose(letter) {
    if (hasAnswered) return
    setAnswers((prev) => ({ ...prev, [index]: letter }))
  }

  function next() {
    if (isLast) {
      onFinish({ answers })
      return
    }
    setIndex((i) => i + 1)
  }

  function prev() {
    setIndex((i) => Math.max(i - 1, 0))
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between text-xs text-muted mb-6">
        <span>Question {index + 1} of {questions.length} &middot; {answeredCount} answered</span>
        <span>{question.topic}{question.subtopic ? ` · ${question.subtopic}` : ''}</span>
      </div>

      <div className="h-0.5 bg-rule mb-8">
        <div
          className="h-0.5 bg-accent transition-all"
          style={{ width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="font-serif text-xl leading-relaxed mb-6">{question.question}</h2>

      <div className="space-y-2">
        {Object.entries(question.options).map(([letter, text]) => {
          const isCorrectOption = letter === question.correctAnswer
          const isSelected = letter === selected

          let stateClasses = 'border-rule hover:border-ink'
          if (hasAnswered && isCorrectOption) {
            stateClasses = 'border-correct bg-correct-bg'
          } else if (hasAnswered && isSelected && !isCorrectOption) {
            stateClasses = 'border-incorrect bg-incorrect-bg'
          }

          return (
            <div key={letter}>
              <button
                onClick={() => choose(letter)}
                disabled={hasAnswered}
                className={`w-full text-left border p-3.5 flex gap-3 ${stateClasses}`}
              >
                <span className="text-sm font-medium text-muted">{letter}</span>
                <span className="text-sm">{text}</span>
              </button>
              {hasAnswered && (isSelected || isCorrectOption) && (
                <p
                  className={`text-sm mt-1.5 mb-2 px-3.5 ${
                    isCorrectOption ? 'text-correct' : 'text-incorrect'
                  }`}
                >
                  {question.explanations[letter]}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prev}
          disabled={index === 0}
          className="text-sm text-muted disabled:opacity-30"
        >
          &larr; Previous
        </button>

        {hasAnswered && (
          <button
            onClick={next}
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium"
          >
            {isLast ? 'Finish' : 'Next question'}
          </button>
        )}
      </div>
    </div>
  )
}
