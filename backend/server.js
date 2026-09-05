import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import quizSetsRouter from './routes/quizSets.js'
import attemptsRouter from './routes/attempts.js'
import authRouter from './routes/auth.js'
import publicQuizSetsRouter from './routes/publicQuizSets.js'
import { authenticate } from './middleware/auth.js'

const app = express()
// In dev (no CORS_ORIGIN set), allow any origin for convenience.
// In production, set CORS_ORIGIN to your deployed frontend's exact URL —
// wildcard CORS on an authenticated API is fine for local dev, not for prod.
app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {}))
app.use(express.json({ limit: '5mb' })) // quiz files can be sizeable

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/public/quiz-sets', publicQuizSetsRouter) // no auth — token in the URL is the gate
app.use('/api/quiz-sets', authenticate, quizSetsRouter)
app.use('/api/attempts', authenticate, attemptsRouter)

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcq-practice-app'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
