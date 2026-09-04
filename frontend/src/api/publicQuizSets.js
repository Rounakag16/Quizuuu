const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function getPublicQuizSet(shareToken) {
  const res = await fetch(`${API_URL}/api/public/quiz-sets/${shareToken}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}
