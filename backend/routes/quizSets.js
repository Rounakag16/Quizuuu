import express from 'express'
import crypto from 'crypto'
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
    const owned = quizSets.map((set) => ({ ...set, userId: req.userId }))
    const created = await QuizSet.insertMany(owned)
    res.status(201).json({ quizSets: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save quiz set(s).' })
  }
})

// GET /api/quiz-sets — only the current user's quiz sets.
router.get('/', async (req, res) => {
  try {
    const sets = await QuizSet.find(
      { userId: req.userId },
      'title subject difficulty questionCount createdAt',
    ).sort({ createdAt: -1 })
    res.json(sets)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list quiz sets.' })
  }
})

// GET /api/quiz-sets/:id — scoped to owner; a mismatched id looks identical
// to a missing one, so this doesn't reveal whether the id belongs to someone else.
router.get('/:id', async (req, res) => {
  try {
    const set = await QuizSet.findOne({ _id: req.params.id, userId: req.userId })
    if (!set) return res.status(404).json({ error: 'Quiz set not found.' })
    res.json(set)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

// DELETE /api/quiz-sets/:id — scoped to owner.
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await QuizSet.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!deleted) return res.status(404).json({ error: 'Quiz set not found.' })
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

// POST /api/quiz-sets/:id/share — generates (or returns the existing) share token.
router.post('/:id/share', async (req, res) => {
  try {
    const set = await QuizSet.findOne({ _id: req.params.id, userId: req.userId })
    if (!set) return res.status(404).json({ error: 'Quiz set not found.' })

    if (!set.shareToken) {
      set.shareToken = crypto.randomBytes(12).toString('hex')
      await set.save()
    }
    res.json({ shareToken: set.shareToken })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

// POST /api/quiz-sets/:id/unshare — revokes the link; a new share generates a fresh token.
router.post('/:id/unshare', async (req, res) => {
  try {
    // $unset, not "shareToken: null" — the sparse unique index only
    // excludes documents missing the field, not ones set to null.
    const set = await QuizSet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $unset: { shareToken: '' } },
    )
    if (!set) return res.status(404).json({ error: 'Quiz set not found.' })
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid quiz set id.' })
  }
})

export default router
