import express from 'express'
import Attempt from '../models/Attempt.js'

const router = express.Router()

// POST /api/attempts
// body: { quizSetId, quizTitle, mode, timeTakenSeconds, score, total, answers: [...] }
router.post('/', async (req, res) => {
  try {
    const attempt = await Attempt.create(req.body)
    res.status(201).json(attempt)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save attempt.' })
  }
})

// GET /api/attempts?quizSetId=... (optional filter)
// Recent-first list, used by a per-quiz or overall attempt history view.
router.get('/', async (req, res) => {
  try {
    const filter = req.query.quizSetId ? { quizSetId: req.query.quizSetId } : {}
    const attempts = await Attempt.find(filter).sort({ createdAt: -1 }).limit(50)
    res.json(attempts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list attempts.' })
  }
})

// GET /api/attempts/weak-areas
// Aggregates every answer across every attempt, grouped by topic, so a
// user can see where they're actually going wrong rather than just a score.
router.get('/weak-areas', async (req, res) => {
  try {
    const results = await Attempt.aggregate([
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.topic',
          total: { $sum: 1 },
          wrong: { $sum: { $cond: ['$answers.isCorrect', 0, 1] } },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          total: 1,
          wrong: 1,
          wrongRate: { $divide: ['$wrong', '$total'] },
        },
      },
      { $sort: { wrongRate: -1, total: -1 } },
    ])
    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to compute weak areas.' })
  }
})

export default router
