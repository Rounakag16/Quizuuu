import { useState } from 'react'
import { PROMPT_TEMPLATE, SCHEMA_ONLY } from '../data/promptTemplate'

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard permission denied — the text is still visible to select manually.
        }
      }}
      className="border border-ink px-4 py-2 text-sm font-medium"
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}

export default function PromptReference({ onBack }) {
  const [tab, setTab] = useState('prompt') // 'prompt' | 'schema'
  const activeText = tab === 'prompt' ? PROMPT_TEMPLATE : SCHEMA_ONLY

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <button onClick={onBack} className="text-sm text-muted mb-8">&larr; Back</button>

      <h1 className="font-serif text-3xl mb-2">Get the prompt</h1>
      <p className="text-sm text-muted mb-6">
        Fill in the bracketed placeholders, paste into any LLM, then upload or paste what it returns.
      </p>

      <div className="flex gap-4 mb-4 text-sm border-b border-rule">
        <button
          onClick={() => setTab('prompt')}
          className={`pb-2 -mb-px border-b-2 ${tab === 'prompt' ? 'border-ink font-medium' : 'border-transparent text-muted'}`}
        >
          Full prompt
        </button>
        <button
          onClick={() => setTab('schema')}
          className={`pb-2 -mb-px border-b-2 ${tab === 'schema' ? 'border-ink font-medium' : 'border-transparent text-muted'}`}
        >
          Schema only
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <CopyButton text={activeText} />
        <button
          onClick={() =>
            download(tab === 'prompt' ? 'mcq-prompt.txt' : 'mcq-schema.json', activeText)
          }
          className="border border-rule px-4 py-2 text-sm font-medium hover:border-ink"
        >
          Download
        </button>
      </div>

      <pre className="border border-rule p-4 text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto bg-white">
        {activeText}
      </pre>
    </div>
  )
}
