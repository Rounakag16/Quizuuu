import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    topic: { type: String, default: 'General' },
    subtopic: { type: String, default: '' },
    difficulty: { type: String, default: 'medium' },
    // options/explanations use dynamic keys (A/B/C/D, occasionally more/fewer),
    // so Mixed keeps this schema-agnostic rather than hardcoding 4 fields.
    options: { type: mongoose.Schema.Types.Mixed, required: true },
    correctAnswer: { type: String, required: true },
    explanations: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false },
)

const quizSetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'General' },
    difficulty: { type: String, default: 'mixed' },
    questionCount: { type: Number, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { timestamps: true },
)

export default mongoose.model('QuizSet', quizSetSchema)
