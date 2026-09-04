import { useState } from 'react'
import { login, register } from '../api/auth'

export default function Login({ onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = mode === 'login' ? await login(email, password) : await register(email, password)
      onAuthed(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <p className="text-sm text-muted mb-1">MCQ Practice</p>
      <h1 className="font-serif text-3xl mb-8">{mode === 'login' ? 'Log in' : 'Create an account'}</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:border-accent"
          />
          {mode === 'register' && <p className="text-xs text-muted mt-1">At least 8 characters.</p>}
        </div>

        {error && <p className="text-sm text-incorrect">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError(null)
        }}
        className="mt-6 text-sm text-muted underline underline-offset-2"
      >
        {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Log in'}
      </button>
    </div>
  )
}
