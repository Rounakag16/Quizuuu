import { useEffect, useRef, useState } from 'react'

/**
 * Drives Test Mode's clock.
 * mode: 'none' | 'countdown' | 'stopwatch'
 * durationSeconds: only used for 'countdown'
 * onExpire: called once, when a countdown reaches 0
 */
export function useClock({ mode, durationSeconds = 0, onExpire }) {
  const [elapsed, setElapsed] = useState(0)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  // Always keep the ref pointing at the latest onExpire, so the interval
  // (created once below) never calls a stale closure over old state.
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (mode === 'none') return
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1
        if (mode === 'countdown' && next >= durationSeconds && !expiredRef.current) {
          expiredRef.current = true
          clearInterval(id)
          onExpireRef.current?.()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, durationSeconds])

  const remaining = mode === 'countdown' ? Math.max(durationSeconds - elapsed, 0) : null

  return { elapsed, remaining }
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
