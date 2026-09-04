import { useEffect, useState } from 'react'
import { getWeakAreas } from '../api/attempts'

export default function Dashboard({ onBack }) {
  const [areas, setAreas] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getWeakAreas()
      .then(setAreas)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <button onClick={onBack} className="text-sm text-muted mb-8">&larr; Back</button>

      <h1 className="font-serif text-3xl mb-1">Weak areas</h1>
      <p className="text-sm text-muted mb-8">Wrong-answer rate by topic, across every attempt you've saved.</p>

      {error && (
        <div className="border border-incorrect bg-incorrect-bg p-4 text-sm text-incorrect">
          Couldn't reach the server — {error}. Make sure the backend is running.
        </div>
      )}

      {!error && areas === null && <p className="text-sm text-muted">Loading…</p>}

      {areas && areas.length === 0 && (
        <p className="text-sm text-muted">No attempts recorded yet — finish a quiz to start seeing this.</p>
      )}

      <div className="space-y-4">
        {areas?.map((a) => (
          <div key={a.topic}>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="font-medium">{a.topic}</span>
              <span className="text-muted">
                {a.wrong}/{a.total} wrong &middot; {Math.round(a.wrongRate * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-rule">
              <div
                className="h-1.5 bg-incorrect"
                style={{ width: `${Math.round(a.wrongRate * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
