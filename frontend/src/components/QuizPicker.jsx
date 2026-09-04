export default function QuizPicker({ quizSets, onPick, onBack }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <button onClick={onBack} className="text-sm text-muted mb-8">&larr; Upload a different file</button>

      <p className="text-sm text-muted mb-1">This file contains {quizSets.length} quizzes</p>
      <h1 className="font-serif text-3xl mb-8">Pick one to start</h1>

      <div className="space-y-2">
        {quizSets.map((set, i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className="w-full text-left border border-rule hover:border-ink p-4"
          >
            <div className="font-medium">{set.title}</div>
            <div className="text-sm text-muted mt-0.5">
              {set.subject} &middot; {set.questions.length} questions &middot; {set.difficulty}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
