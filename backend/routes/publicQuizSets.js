import express from 'express'
import QuizSet from '../models/QuizSet.js'

const router = express.Router()

// GET /api/public/quiz-sets/:shareToken
// No auth required — a random 24-char token is the only thing gating access.
// Excludes userId so the owner's identity isn't exposed to whoever has the link.
router.get('/:shareToken', async (req, res) => {
  try {
    const set = await QuizSet.findOne({ shareToken: req.params.shareToken }).select('-userId')
    if (!set) return res.status(404).json({ error: 'This link is invalid or has been revoked.' })
    res.json(set)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid link.' })
  }
})

export default router
