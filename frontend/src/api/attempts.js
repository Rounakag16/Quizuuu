const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export async function saveAttempt(attempt) {
  const res = await fetch(`${API_URL}/api/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt),
  })
  return handle(res)
}

export async function getWeakAreas() {
  const res = await fetch(`${API_URL}/api/attempts/weak-areas`)
  return handle(res) // [{ topic, total, wrong, wrongRate }, ...]
}
