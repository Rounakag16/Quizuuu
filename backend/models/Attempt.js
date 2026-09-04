import mongoose from 'mongoose'

// Each answer is denormalized with its topic/subtopic at save time, so
// weak-area aggregation is a single query over Attempts — no need to
// join back to QuizSet (which could later be edited or deleted).
const answerSchema = new mongoose.Schema(
  {
    topic: { type: String, default: 'General' },
    subtopic: { type: String, default: '' },
    selected: { type: String, default: null }, // null = left unanswered
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
)

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizSet', required: true },
    quizTitle: { type: String, required: true }, // denormalized for display without a join
    mode: { type: String, enum: ['practice', 'test'], required: true },
    timeTakenSeconds: { type: Number, default: null },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: { type: [answerSchema], required: true },
  },
  { timestamps: true },
)

export default mongoose.model('Attempt', attemptSchema)
