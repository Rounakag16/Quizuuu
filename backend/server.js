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
app.use(cors())
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
