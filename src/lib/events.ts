/** Cross-block hand-off: open a department with one of its AI employees selected. */
const FOCUS_EVENT = 'neuronium:focus-employee'

export const focusEmployee = (n: number) => window.dispatchEvent(new CustomEvent<number>(FOCUS_EVENT, { detail: n }))

export const onFocusEmployee = (fn: (n: number) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<number>).detail)
  window.addEventListener(FOCUS_EVENT, handler)
  return () => window.removeEventListener(FOCUS_EVENT, handler)
}
