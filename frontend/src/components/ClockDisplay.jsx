import { formatTime } from '../hooks/useClock'

export default function ClockDisplay({ mode, elapsed, remaining }) {
  if (mode === 'none') return null

  const isLow = mode === 'countdown' && remaining <= 30

  return (
    <div className={`text-sm tabular-nums ${isLow ? 'text-incorrect font-medium' : 'text-muted'}`}>
      {mode === 'countdown' ? formatTime(remaining) : formatTime(elapsed)}
      <span className="text-xs ml-1">{mode === 'countdown' ? 'left' : 'elapsed'}</span>
    </div>
  )
}
