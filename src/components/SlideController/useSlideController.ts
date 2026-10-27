import { useCallback, useEffect, useRef, useState } from 'react'

export type NavSource = 'wheel' | 'key' | 'touch' | 'ui'

/** Time a transition owns the screen; input arriving meanwhile cannot start another one. */
export const TRANSITION_MS = 820
const WHEEL_GAP_MS = 170
const WHEEL_THRESHOLD = 28
const SWIPE_THRESHOLD = 46
/** After an inner area scrolls to its end, the deck waits this long before a wheel may turn the slide. */
const EDGE_COOLDOWN_MS = 650
const EDGE_SLACK = 12

const isEditable = (el: Element | null) =>
  !!el &&
  (el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el as HTMLElement).isContentEditable)

/** Nearest ancestor (inside the slide) that is a vertical scroll area with overflowing content. */
function scrollArea(start: EventTarget | null): HTMLElement | null {
  let el = start instanceof Element ? (start as HTMLElement) : null
  while (el && el !== document.body) {
    if (el.dataset.slide !== undefined) return null
    if (el.scrollHeight > el.clientHeight + EDGE_SLACK) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll') return el
    }
    el = el.parentElement
  }
  return null
}

/**
 * Finds the nearest ancestor (inside the slide) that can scroll vertically in `dir`.
 * A gesture that starts over such an element belongs to that element, not to the deck.
 */
function scrollableIn(start: EventTarget | null, dir: 1 | -1): HTMLElement | null {
  let el = start instanceof Element ? (start as HTMLElement) : null
  while (el && el !== document.body) {
    if (el.dataset.slide !== undefined) return null
    if (el.scrollHeight > el.clientHeight + 1) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll') {
        // A few pixels of leftover overflow must not trap the gesture.
        const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - EDGE_SLACK
        const canUp = el.scrollTop > EDGE_SLACK
        if ((dir > 0 && canDown) || (dir < 0 && canUp)) return el
      }
    }
    el = el.parentElement
  }
  return null
}

/**
 * Slide Controller — one gesture moves exactly one complete slide.
 * Supports mouse wheel, trackpads (inertia is treated as part of the same gesture),
 * keyboard (arrows, PageUp/PageDown, Space, Home/End) and touch swipes.
 * Inner scroll areas keep their own scrolling: a gesture that starts where content can
 * still scroll never changes the slide.
 */
export function useSlideController(count: number, initial: number) {
  const [index, setIndex] = useState(initial)
  const indexRef = useRef(initial)
  const lockUntil = useRef(0)

  const go = useCallback(
    (target: number, from: NavSource = 'ui') => {
      const next = Math.max(0, Math.min(count - 1, target))
      if (next === indexRef.current) return false
      indexRef.current = next
      lockUntil.current = performance.now() + (from === 'key' ? TRANSITION_MS * 0.55 : TRANSITION_MS)
      setIndex(next)
      return true
    },
    [count],
  )

  useEffect(() => {
    // ---------- wheel / trackpad ----------
    let lastWheel = 0
    let lastAbs = 0
    let lastInner = 0
    let gesture = { consumed: false, acc: 0, inner: false }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // pinch-zoom
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const dy = e.deltaY * unit
      const dx = e.deltaX * unit
      if (Math.abs(dx) > Math.abs(dy)) return // horizontal scrolling belongs to the content
      const dir: 1 | -1 = dy > 0 ? 1 : -1
      const now = performance.now()
      const abs = Math.abs(dy)
      const gap = now - lastWheel
      lastWheel = now

      // A new gesture: after a pause, or a clear new push while an inertia tail decays.
      const fresh =
        gap > WHEEL_GAP_MS ||
        (gesture.consumed && now > lockUntil.current && abs > 12 && abs > lastAbs * 2.2)
      lastAbs = abs
      if (fresh) gesture = { consumed: false, acc: 0, inner: !!scrollableIn(e.target, dir) }

      if (gesture.inner) {
        lastInner = now
        return // let the inner area scroll natively
      }
      e.preventDefault()
      // Just reached the end of an inner list: hold the slide until the user pauses.
      if (now - lastInner < EDGE_COOLDOWN_MS && scrollArea(e.target)) {
        lastInner = now
        return
      }
      if (gesture.consumed || now < lockUntil.current) return
      gesture.acc += dy
      if (Math.abs(gesture.acc) >= WHEEL_THRESHOLD) {
        gesture.consumed = true
        go(indexRef.current + dir, 'wheel')
      }
    }

    // ---------- keyboard ----------
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return
      const active = document.activeElement
      if (isEditable(active)) return
      if (active?.closest('[data-own-keys]') && e.key.startsWith('Arrow')) return
      const onControl =
        active instanceof HTMLButtonElement ||
        active instanceof HTMLAnchorElement ||
        active?.getAttribute('role') === 'button' ||
        active?.getAttribute('role') === 'tab'

      let target: number | null = null
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          target = indexRef.current + 1
          break
        case 'ArrowUp':
        case 'PageUp':
          target = indexRef.current - 1
          break
        case ' ':
        case 'Spacebar':
          if (onControl) return
          target = indexRef.current + (e.shiftKey ? -1 : 1)
          break
        case 'Home':
          target = 0
          break
        case 'End':
          target = count - 1
          break
        default:
          return
      }
      if (e.key.startsWith('Arrow') || e.key.startsWith('Page')) {
        // Arrow keys inside a scrollable region scroll it first.
        const dir = target > indexRef.current ? 1 : -1
        if (active && active !== document.body && scrollableIn(active, dir as 1 | -1)) return
      }
      e.preventDefault()
      if (e.repeat && performance.now() < lockUntil.current) return
      if (performance.now() < lockUntil.current) return
      go(target, 'key')
    }

    // ---------- touch ----------
    let touch: {
      x: number
      y: number
      t: number
      down: HTMLElement | null
      up: HTMLElement | null
      skip: boolean
    } | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touch = null
        return
      }
      const t = e.touches[0]
      const el = e.target as Element
      touch = {
        x: t.clientX,
        y: t.clientY,
        t: performance.now(),
        down: scrollableIn(el, 1),
        up: scrollableIn(el, -1),
        skip: isEditable(el) || !!el.closest?.('input[type="range"], [data-no-swipe]'),
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!touch || touch.skip || !e.cancelable) return
      const t = e.touches[0]
      const dx = t.clientX - touch.x
      const dy = t.clientY - touch.y
      if (Math.abs(dy) <= Math.abs(dx)) return
      const dir = dy < 0 ? 1 : -1
      const inner = dir > 0 ? touch.down : touch.up
      if (!inner) e.preventDefault() // stop rubber-banding of the page itself
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touch || touch.skip) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touch.x
      const dy = touch.y - t.clientY
      const quick = performance.now() - touch.t < 1500
      const start = touch
      touch = null
      if (!quick || Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) < Math.abs(dx) * 1.2) return
      const dir = dy > 0 ? 1 : -1
      if ((dir > 0 && start.down) || (dir < 0 && start.up)) return
      if (performance.now() < lockUntil.current) return
      go(indexRef.current + dir, 'touch')
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [count, go])

  return { index, go }
}
