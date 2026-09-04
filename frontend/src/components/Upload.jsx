import { useCallback, useState } from 'react'
import { validateQuizFile, normalizeQuizFile } from '../utils/validateQuiz'
import { saveQuizSets } from '../api/quizSets'
import sampleQuiz from '../data/sampleQuiz.json'

export default function Upload({ onLoaded, onViewLibrary, onViewDashboard }) {
  const [errors, setErrors] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState('file') // 'file' | 'paste'
  const [pasteValue, setPasteValue] = useState('')
  const [saving, setSaving] = useState(false)

  const processText = useCallback(
    async (text) => {
      setErrors([])
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        setErrors(['This isn\u2019t valid JSON. Check for a stray comma, missing bracket, or markdown fences left in by the LLM.'])
        return
      }

      const { valid, errors: validationErrors } = validateQuizFile(data)
      if (!valid) {
        setErrors(validationErrors)
        return
      }

      const normalized = normalizeQuizFile(data)
      setSaving(true)
      try {
        const saved = await saveQuizSets(normalized.quizSets)
        onLoaded(saved) // { quizSets: [...with _id from the database] }
      } catch (err) {
        setErrors([`Couldn't save this quiz — ${err.message}. Make sure the backend server is running.`])
      } finally {
        setSaving(false)
      }
    },
    [onLoaded],
  )

  const handleFile = useCallback(
    (file) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => processText(reader.result)
      reader.onerror = () => setErrors(['Could not read that file.'])
      reader.readAsText(file)
    },
    [processText],
  )

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const ErrorList = errors.length > 0 && (
    <div className="mt-6 border border-incorrect bg-incorrect-bg p-4">
      <p className="text-sm font-medium text-incorrect mb-2">
        {errors.length} problem{errors.length > 1 ? 's' : ''} found
      </p>
      <ul className="text-sm text-incorrect space-y-1 list-disc list-inside">
        {errors.slice(0, 10).map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
      {errors.length > 10 && (
        <p className="text-xs text-incorrect mt-2">and {errors.length - 10} more…</p>
      )}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted">MCQ Practice</p>
        <div className="flex gap-4">
          <button onClick={onViewDashboard} className="text-sm text-muted underline underline-offset-2">
            Weak areas
          </button>
          <button onClick={onViewLibrary} className="text-sm text-muted underline underline-offset-2">
            Saved quizzes
          </button>
        </div>
      </div>
      <h1 className="font-serif text-3xl mb-2">Load your quiz</h1>
      <p className="text-sm text-muted mb-6">
        Generate a quiz JSON with the copy-paste prompt, then upload the file or paste it directly.
      </p>

      <div className="flex gap-4 mb-6 text-sm border-b border-rule">
        <button
          onClick={() => { setMode('file'); setErrors([]) }}
          className={`pb-2 -mb-px border-b-2 ${mode === 'file' ? 'border-ink font-medium' : 'border-transparent text-muted'}`}
        >
          Upload file
        </button>
        <button
          onClick={() => { setMode('paste'); setErrors([]) }}
          className={`pb-2 -mb-px border-b-2 ${mode === 'paste' ? 'border-ink font-medium' : 'border-transparent text-muted'}`}
        >
          Paste JSON
        </button>
      </div>

      {mode === 'file' && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`block border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-accent bg-white' : 'border-rule'
          }`}
        >
          <p className="text-sm font-medium mb-1">
            {saving ? 'Saving…' : 'Drop a .json file here, or click to browse'}
          </p>
          <p className="text-xs text-muted">Only structural format is checked — question content isn't verified.</p>
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            disabled={saving}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      )}

      {mode === 'paste' && (
        <div>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder="Paste the JSON your LLM generated here…"
            rows={10}
            className="w-full border border-rule p-3 text-sm font-mono focus:border-accent"
          />
          <button
            onClick={() => processText(pasteValue)}
            disabled={!pasteValue.trim() || saving}
            className="mt-3 bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Load quiz'}
          </button>
        </div>
      )}

      {ErrorList}

      <button
        onClick={() => onLoaded(normalizeQuizFile(sampleQuiz), { unsaved: true })}
        className="mt-8 text-sm text-muted underline underline-offset-2"
      >
        Or try the sample OS quiz (not saved)
      </button>
    </div>
  )
}
