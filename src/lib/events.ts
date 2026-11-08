/** Cross-block hand-off: open a department with one of its AI employees selected. */
const FOCUS_EVENT = 'neuronium:focus-employee'

export const focusEmployee = (n: number) => window.dispatchEvent(new CustomEvent<number>(FOCUS_EVENT, { detail: n }))

export const onFocusEmployee = (fn: (n: number) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<number>).detail)
  window.addEventListener(FOCUS_EVENT, handler)
  return () => window.removeEventListener(FOCUS_EVENT, handler)
}

/** Open the contact widget (bottom right), optionally with a subject already written in. */
const CONTACT_EVENT = 'neuronium:contact'

export const openContact = (subject = '') => window.dispatchEvent(new CustomEvent<string>(CONTACT_EVENT, { detail: subject }))

export const onOpenContact = (fn: (subject: string) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<string>).detail)
  window.addEventListener(CONTACT_EVENT, handler)
  return () => window.removeEventListener(CONTACT_EVENT, handler)
}
