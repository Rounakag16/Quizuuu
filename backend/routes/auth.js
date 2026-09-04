import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticate, JWT_SECRET } from '../middleware/auth.js'

const router = express.Router()

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' })
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Email and a password of at least 8 characters are required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email: normalizedEmail, passwordHash })
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to register.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() })
    // Same error for "no such user" and "wrong password" — don't reveal which.
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

    const valid = await bcrypt.compare(password || '', user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' })

    const token = signToken(user)
    res.json({ token, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log in.' })
  }
})

// Lets the frontend restore a session from a stored token on page load.
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId, 'email')
    if (!user) return res.status(401).json({ error: 'Session no longer valid.' })
    res.json({ id: user._id, email: user.email })
  } catch (err) {
    res.status(401).json({ error: 'Session no longer valid.' })
  }
})

export default router
