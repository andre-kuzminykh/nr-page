import type { EmployeeId } from '../data/employees'

/** Cross-slide hand-off: open the capabilities catalog on a given AI Employee. */
const CATALOG_EVENT = 'neuronium:catalog'

export const openCatalogAt = (id: EmployeeId) =>
  window.dispatchEvent(new CustomEvent<EmployeeId>(CATALOG_EVENT, { detail: id }))

export const onCatalogRequest = (fn: (id: EmployeeId) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<EmployeeId>).detail)
  window.addEventListener(CATALOG_EVENT, handler)
  return () => window.removeEventListener(CATALOG_EVENT, handler)
}
