import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Every quiz-set/attempt route sits behind this — the app has no
// meaningful anonymous mode, so there's no "optional" variant.
export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated.' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session.' })
  }
}

export { JWT_SECRET }
