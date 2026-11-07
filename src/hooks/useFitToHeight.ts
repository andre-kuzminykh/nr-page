import { useLayoutEffect, type RefObject } from 'react'

const MIN_FIT = 0.55

/**
 * Keeps a block's content inside the window: blocks never scroll inside. When the content of the
 * section's `.slide__frame` is taller than the frame, the frame is drawn smaller (`--fit`, used as
 * CSS zoom) until it fits. While the block is on screen it only ever shrinks (an FAQ answer that
 * opens makes it smaller once, closing it does not make it jump back); it is measured afresh when
 * the window changes size and whenever the block is reached.
 */
export function useFitToHeight(section: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    const el = section.current
    const frame = el?.querySelector<HTMLElement>(':scope > .slide__frame')
    if (!el || !frame) return
    let fit = 1
    let busy = false
    let raf = 0

    // the content's height and the room for it, both in the frame's own units
    const measure = () => {
      let top = Infinity
      let bottom = -Infinity
      for (const c of frame.children) {
        const k = c as HTMLElement
        if (!k.offsetHeight || getComputedStyle(k).position === 'absolute' || getComputedStyle(k).position === 'fixed') continue
        top = Math.min(top, k.offsetTop)
        bottom = Math.max(bottom, k.offsetTop + k.offsetHeight)
      }
      if (top === Infinity) return null
      const cs = getComputedStyle(frame)
      const need = bottom - top + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      return { need, have: frame.clientHeight }
    }

    const apply = (z: number) => {
      fit = z
      frame.style.setProperty('--fit', z === 1 ? '1' : z.toFixed(4))
    }

    const run = (fresh: boolean) => {
      busy = true
      let z = fresh ? 1 : fit
      apply(z)
      for (let i = 0; i < 5; i++) {
        const m = measure()
        if (!m) break
        const next = Math.max(MIN_FIT, Math.min(fresh ? 1 : fit, (z * m.have) / m.need) * (m.need > m.have + 0.5 ? 0.997 : 1))
        if (Math.abs(next - z) < 0.002) break
        z = next
        apply(z)
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        busy = false
      })
    }

    run(true)
    let lastW = el.clientWidth
    let lastH = el.clientHeight
    const ro = new ResizeObserver(() => {
      if (busy) return
      const resized = el.clientWidth !== lastW || el.clientHeight !== lastH
      lastW = el.clientWidth
      lastH = el.clientHeight
      run(resized)
    })
    ro.observe(el)
    for (const c of frame.children) ro.observe(c)
    let alive = true
    document.fonts?.ready.then(() => alive && run(true))
    return () => {
      alive = false
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [section, active])
}
