import { AI_EMPLOYEES, type AIEmployee } from './departments.ts'
import { isEmployeeOpen } from './release.ts'

/** The AI employees that are open on the site (see release.ts), in order. */
export const READY: AIEmployee[] = AI_EMPLOYEES.filter((e) => isEmployeeOpen(e.n))

/** “Knowledge Management”, “Knowledge Management and Note Taking”, … or “12 AI employees”. */
export const readyList = (ready: AIEmployee[]): string => {
  const names = ready.map((e) => e.name)
  if (names.length > 4) return `${names.length} AI employees`
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}
