// Structural validation only, per project decision: the site doesn't try to
// judge content/logical correctness (that's on the prompt + whichever LLM
// the user chose) — it just enforces that the shape is usable by the app.

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

export function validateQuizFile(data) {
  const errors = []

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Root of the file must be a JSON object.'] }
  }

  if (!Array.isArray(data.quizSets) || data.quizSets.length === 0) {
    return { valid: false, errors: ['Missing or empty "quizSets" array at the root.'] }
  }

  data.quizSets.forEach((set, setIndex) => {
    const setLabel = `quizSets[${setIndex}]`

    if (!isNonEmptyString(set.title)) {
      errors.push(`${setLabel}: missing "title".`)
    }

    if (!Array.isArray(set.questions) || set.questions.length === 0) {
      errors.push(`${setLabel}: missing or empty "questions" array.`)
      return // no point validating questions that don't exist
    }

    set.questions.forEach((q, qIndex) => {
      const qLabel = `${setLabel}.questions[${qIndex}]`

      if (!isNonEmptyString(q.question)) {
        errors.push(`${qLabel}: missing "question" text.`)
      }

      const optionKeys = q.options && typeof q.options === 'object' ? Object.keys(q.options) : []
      if (optionKeys.length < 2) {
        errors.push(`${qLabel}: needs at least 2 "options".`)
      }
      optionKeys.forEach((key) => {
        if (!isNonEmptyString(q.options[key])) {
          errors.push(`${qLabel}.options.${key}: empty option text.`)
        }
      })

      if (!isNonEmptyString(q.correctAnswer)) {
        errors.push(`${qLabel}: missing "correctAnswer".`)
      } else if (!optionKeys.includes(q.correctAnswer)) {
        errors.push(`${qLabel}: "correctAnswer" (${q.correctAnswer}) doesn't match any option key.`)
      }

      const explanations = q.explanations && typeof q.explanations === 'object' ? q.explanations : {}
      optionKeys.forEach((key) => {
        if (!isNonEmptyString(explanations[key])) {
          errors.push(`${qLabel}.explanations.${key}: missing explanation for this option.`)
        }
      })
    })
  })

  return { valid: errors.length === 0, errors }
}

// Fills in sensible defaults for optional fields so the rest of the app
// doesn't need to guard against undefined topic/subtopic/difficulty everywhere.
export function normalizeQuizFile(data) {
  return {
    quizSets: data.quizSets.map((set) => ({
      title: set.title,
      subject: set.subject || 'General',
      difficulty: set.difficulty || 'mixed',
      questionCount: set.questions.length,
      questions: set.questions.map((q) => ({
        question: q.question,
        topic: q.topic || set.subject || 'General',
        subtopic: q.subtopic || '',
        difficulty: q.difficulty || set.difficulty || 'medium',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanations: q.explanations,
      })),
    })),
  }
}
