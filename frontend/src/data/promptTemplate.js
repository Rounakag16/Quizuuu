// Kept as a single source of truth so the in-app "Get the prompt" screen
// always matches what's actually been tested — update here if the prompt
// itself changes.
export const PROMPT_TEMPLATE = `You are generating multiple-choice questions (MCQs) for a quiz practice app. You must output ONLY valid JSON matching the exact schema below — no markdown code fences, no preamble, no explanation text outside the JSON, no trailing commentary. Your entire response must be parseable as JSON.

TOPIC: [TOPIC]
SUBJECT: [SUBJECT]
NUMBER OF QUESTIONS: [NUMBER]
DIFFICULTY: [easy | medium | hard | mixed]

Requirements:
1. Generate exactly [NUMBER] questions on [TOPIC] within [SUBJECT].
2. Each question has exactly 4 options (A, B, C, D) with exactly one correct answer.
3. Avoid ambiguous questions or questions with more than one defensible correct answer.
4. For EVERY option (all 4, including the correct one), write a specific explanation:
   - For the correct option: explain precisely why it is correct.
   - For each incorrect option: explain precisely why it is wrong — not just "this is incorrect," but the actual misconception or error it represents.
5. Assign each question a "topic" (matching or narrower than [TOPIC]) and an optional "subtopic" for finer categorization.
6. If DIFFICULTY is "mixed," vary each question's individual "difficulty" field across easy/medium/hard. Otherwise set every question's difficulty to match [DIFFICULTY].
7. Keep each explanation concise (1-3 sentences) but substantive — a student should understand the underlying concept from it, not just get a verdict.
8. For any question requiring calculation or multi-step reasoning (math, logic, numerical reasoning), work out the answer step by step BEFORE deciding the "correctAnswer" letter. Then write the explanations to match that derivation exactly. The "correctAnswer" field and the explanation marked as correct must never contradict each other — if you notice a mismatch, fix the "correctAnswer" field to match your actual derivation, do not leave contradictory reasoning in the explanation text.
9. Before finalizing your output, silently re-check every question: does the explanation for "correctAnswer" actually justify that specific option, with no arithmetic or logical error? If not, correct it before responding.

Output must be a single JSON object matching exactly this schema:

{
  "quizSets": [
    {
      "title": "string",
      "subject": "string",
      "difficulty": "easy | medium | hard | mixed",
      "questionCount": [NUMBER],
      "questions": [
        {
          "question": "string",
          "topic": "string",
          "subtopic": "string",
          "difficulty": "easy | medium | hard",
          "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
          "correctAnswer": "A | B | C | D",
          "explanations": { "A": "string", "B": "string", "C": "string", "D": "string" }
        }
      ]
    }
  ]
}

Return ONLY the JSON. Do not wrap it in \`\`\` code fences.`

export const SCHEMA_ONLY = `{
  "quizSets": [
    {
      "title": "string",
      "subject": "string",
      "difficulty": "easy | medium | hard | mixed",
      "questionCount": 10,
      "questions": [
        {
          "question": "string",
          "topic": "string",
          "subtopic": "string",
          "difficulty": "easy | medium | hard",
          "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
          "correctAnswer": "A | B | C | D",
          "explanations": { "A": "string", "B": "string", "C": "string", "D": "string" }
        }
      ]
    }
  ]
}`
