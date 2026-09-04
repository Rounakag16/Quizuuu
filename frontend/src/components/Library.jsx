import { useEffect, useState } from 'react'
import { listQuizSets, getQuizSet, deleteQuizSet, shareQuizSet } from '../api/quizSets'

export default function Library({ onPick, onBack }) {
  const [sets, setSets] = useState(null)
  const [error, setError] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [sharingId, setSharingId] = useState(null)
  const [shareLinks, setShareLinks] = useState({}) // id -> link
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    listQuizSets()
      .then(setSets)
      .catch((err) => setError(err.message))
  }, [])

  async function pick(id) {
    setLoadingId(id)
    try {
      const full = await getQuizSet(id)
      onPick(full)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  async function confirmDelete(id) {
    setDeletingId(id)
    try {
      await deleteQuizSet(id)
      setSets((prev) => prev.filter((s) => s._id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  async function share(id) {
    setSharingId(id)
    try {
      const { shareToken } = await shareQuizSet(id)
      const link = `${window.location.origin}${window.location.pathname}?shared=${shareToken}`
      setShareLinks((prev) => ({ ...prev, [id]: link }))
      try {
        await navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } catch {
        // Clipboard permission denied — the link is still shown below to copy manually.
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSharingId(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <button onClick={onBack} className="text-sm text-muted mb-8">&larr; Load a new quiz</button>

      <h1 className="font-serif text-3xl mb-8">Saved quizzes</h1>

      {error && (
        <div className="border border-incorrect bg-incorrect-bg p-4 text-sm text-incorrect mb-6">
          Couldn't reach the server — {error}. Make sure the backend is running.
        </div>
      )}

      {!error && sets === null && <p className="text-sm text-muted">Loading…</p>}

      {sets && sets.length === 0 && (
        <p className="text-sm text-muted">Nothing saved yet — quizzes you upload will show up here.</p>
      )}

      <div className="space-y-2">
        {sets?.map((set) => (
          <div key={set._id} className="border border-rule hover:border-ink">
            <div className="flex items-stretch">
              <button
                onClick={() => pick(set._id)}
                disabled={loadingId === set._id}
                className="flex-1 text-left p-4 disabled:opacity-50"
              >
                <div className="font-medium">{set.title}</div>
                <div className="text-sm text-muted mt-0.5">
                  {set.subject} &middot; {set.questionCount} questions &middot; {set.difficulty}
                </div>
              </button>

              <button
                onClick={() => share(set._id)}
                disabled={sharingId === set._id}
                className="px-4 text-sm text-muted hover:text-accent border-l border-rule"
              >
                {copiedId === set._id ? 'Copied!' : sharingId === set._id ? 'Sharing…' : 'Share'}
              </button>

              {confirmingId === set._id ? (
                <div className="flex items-center gap-2 px-4 border-l border-rule">
                  <button
                    onClick={() => confirmDelete(set._id)}
                    disabled={deletingId === set._id}
                    className="text-sm text-incorrect font-medium"
                  >
                    {deletingId === set._id ? 'Deleting…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="text-sm text-muted"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(set._id)}
                  className="px-4 text-sm text-muted hover:text-incorrect border-l border-rule"
                  aria-label={`Delete ${set.title}`}
                >
                  Delete
                </button>
              )}
            </div>

            {shareLinks[set._id] && (
              <div className="border-t border-rule p-3">
                <input
                  readOnly
                  value={shareLinks[set._id]}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-xs text-muted bg-transparent focus:outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
