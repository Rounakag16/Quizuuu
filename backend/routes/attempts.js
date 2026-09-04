import express from 'express'
import mongoose from 'mongoose'
import Attempt from '../models/Attempt.js'

const router = express.Router()

// POST /api/attempts
router.post('/', async (req, res) => {
  try {
    const attempt = await Attempt.create({ ...req.body, userId: req.userId })
    res.status(201).json(attempt)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save attempt.' })
  }
})

// GET /api/attempts?quizSetId=... (optional filter) — current user only.
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.userId }
    if (req.query.quizSetId) filter.quizSetId = req.query.quizSetId
    const attempts = await Attempt.find(filter).sort({ createdAt: -1 }).limit(50)
    res.json(attempts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list attempts.' })
  }
})

// GET /api/attempts/weak-areas — scoped to the current user's own attempts.
router.get('/weak-areas', async (req, res) => {
  try {
    const results = await Attempt.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
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
