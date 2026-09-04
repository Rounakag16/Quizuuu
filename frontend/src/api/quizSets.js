const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export async function saveQuizSets(quizSets) {
  const res = await fetch(`${API_URL}/api/quiz-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizSets }),
  })
  return handle(res) // { quizSets: [...with _id] }
}

export async function listQuizSets() {
  const res = await fetch(`${API_URL}/api/quiz-sets`)
  return handle(res) // [{ _id, title, subject, difficulty, questionCount, createdAt }, ...]
}

export async function getQuizSet(id) {
  const res = await fetch(`${API_URL}/api/quiz-sets/${id}`)
  return handle(res) // full quiz set with questions
}

export async function deleteQuizSet(id) {
  const res = await fetch(`${API_URL}/api/quiz-sets/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
}
