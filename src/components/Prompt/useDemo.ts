import { useCallback, useEffect, useRef, useState } from 'react'

/** After the demo, “Try it yourself” stands this long; then the demo starts over. */
export const TRY_MS = 9000

/**
 * Drives a Prompt's demo: step `k` types itself and is sent; `next()` ends the step (or it ends by
 * itself `after` ms after it is sent). After the last step the bar invites the visitor to try it,
 * and after TRY_MS the demo starts over. While the visitor has the bar, everything waits.
 */
export function useDemo(count: number, { live, shown, after }: { live: boolean; shown: boolean; after?: number }) {
  const [k, setK] = useState(0)
  const [sent, setSent] = useState(false)
  const [own, setOwn] = useState(false)
  const [tryIt, setTryIt] = useState(false)
  const at = useRef(k)
  at.current = k

  useEffect(() => {
    if (!shown) {
      setK(0)
      setSent(false)
      setTryIt(false)
    }
  }, [shown])
  // leaving the block mid-step starts the step over next time
  useEffect(() => {
    if (!live) setSent(false)
  }, [live])

  const next = useCallback(() => {
    setSent(false)
    if (at.current >= count - 1) setTryIt(true)
    else setK(at.current + 1)
  }, [count])

  useEffect(() => {
    if (after === undefined || !sent || own) return
    const t = window.setTimeout(next, after)
    return () => window.clearTimeout(t)
  }, [after, sent, own, next])

  useEffect(() => {
    if (!tryIt || own || !live) return
    const t = window.setTimeout(() => {
      setTryIt(false)
      setK(0)
    }, TRY_MS)
    return () => window.clearTimeout(t)
  }, [tryIt, own, live])

  const go = sent && !own
  return {
    k,
    /** the step is sent and the visitor does not have the bar */
    go,
    next,
    /** props for the Prompt */
    bar: {
      sent: go,
      tryIt,
      onSent: () => setSent(true),
      onTake: () => {
        setOwn(true)
        setSent(false)
      },
      onLeave: () => {
        setOwn(false)
        setTryIt(true)
      },
    },
  }
}
