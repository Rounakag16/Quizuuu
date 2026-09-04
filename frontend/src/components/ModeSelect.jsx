import { useState } from 'react'

const CLOCK_OPTIONS = [
  { value: 'none', label: 'No timer', hint: 'Take as long as you need.' },
  { value: 'countdown', label: 'Countdown', hint: 'Simulates real exam pressure. Auto-submits at zero.' },
  { value: 'stopwatch', label: 'Stopwatch', hint: 'Tracks your pace. No forced cutoff.' },
]

export default function ModeSelect({ quizSet, onStart }) {
  const [mode, setMode] = useState(null)
  const [clock, setClock] = useState('none')
  const [minutes, setMinutes] = useState(10)

  function start() {
    if (mode === 'practice') {
      onStart({ mode: 'practice' })
    } else if (mode === 'test') {
      onStart({
        mode: 'test',
        clock,
        durationSeconds: clock === 'countdown' ? minutes * 60 : 0,
      })
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <p className="text-sm text-muted mb-1">{quizSet.subject}</p>
      <h1 className="font-serif text-3xl leading-snug mb-1">{quizSet.title}</h1>
      <p className="text-sm text-muted mb-10">{quizSet.questionCount} questions &middot; difficulty: {quizSet.difficulty}</p>

      <div className="space-y-3 mb-8">
        <button
          onClick={() => setMode('practice')}
          className={`w-full text-left border rounded-none p-4 transition-colors ${
            mode === 'practice' ? 'border-accent bg-white' : 'border-rule hover:border-ink'
          }`}
        >
          <div className="font-medium">Practice Mode</div>
          <div className="text-sm text-muted mt-0.5">Answer one question at a time, see the reasoning right away.</div>
        </button>

        <button
          onClick={() => setMode('test')}
          className={`w-full text-left border rounded-none p-4 transition-colors ${
            mode === 'test' ? 'border-accent bg-white' : 'border-rule hover:border-ink'
          }`}
        >
          <div className="font-medium">Test Mode</div>
          <div className="text-sm text-muted mt-0.5">Answer everything first, review explanations at the end.</div>
        </button>
      </div>

      {mode === 'test' && (
        <div className="border-t border-rule pt-6 mb-8">
          <p className="text-sm font-medium mb-3">Clock</p>
          <div className="space-y-2">
            {CLOCK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 border cursor-pointer ${
                  clock === opt.value ? 'border-accent' : 'border-rule'
                }`}
              >
                <input
                  type="radio"
                  name="clock"
                  value={opt.value}
                  checked={clock === opt.value}
                  onChange={() => setClock(opt.value)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs text-muted">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {clock === 'countdown' && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-muted" htmlFor="minutes">Duration (minutes)</label>
              <input
                id="minutes"
                type="number"
                min={1}
                max={180}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-20 border border-rule px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>
      )}

      <button
        onClick={start}
        disabled={!mode}
        className="bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Start quiz
      </button>
    </div>
  )
}
