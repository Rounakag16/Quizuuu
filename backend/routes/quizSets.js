import express from 'express'
import QuizSet from '../models/QuizSet.js'

const router = express.Router()

// POST /api/quiz-sets
// body: { quizSets: [{ title, subject, difficulty, questionCount, questions }, ...] }
// Accepts an array because one uploaded file can contain multiple quiz sets.
router.post('/', async (req, res) => {
  try {
    const { quizSets } = req.body
    if (!Array.isArray(quizSets) || quizSets.length === 0) {
      return res.status(400).json({ error: 'Expected a non-empty "quizSets" array.' })
    }
    const created = await QuizSet.insertMany(quizSets)
    res.status(201).json({ quizSets: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save quiz set(s).' })
  }
})

// GET /api/quiz-sets
// Lightweight list for the library screen — no question bodies, just summaries.
router.get('/', async (req, res) => {
  try {
    const sets = await QuizSet.find({}, 'title subject difficulty questionCount createdAt').sort({
      createdAt: -1,
    })
    res.json(sets)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list quiz sets.' })
  }
})

// GET /api/quiz-sets/:id
router.get('/:id', async (req, res) => {
  try {
    const set = await QuizSet.findById(req.params.id)
    if (!set) return res.status(404).json({ error: 'Quiz set not found.' })
    res.json(set)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

// DELETE /api/quiz-sets/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await QuizSet.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Quiz set not found.' })
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

export default router
