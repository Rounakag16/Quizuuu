export default function QuestionNav({ total, currentIndex, answeredIndices, onJump }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-6" role="navigation" aria-label="Jump to question">
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === currentIndex
        const isAnswered = answeredIndices.has(i)

        let classes = 'border-rule text-muted hover:border-ink'
        if (isCurrent) classes = 'border-accent text-accent font-medium'
        else if (isAnswered) classes = 'border-ink bg-ink text-paper'

        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ', not answered'}`}
            className={`w-7 h-7 text-xs border flex items-center justify-center ${classes}`}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
