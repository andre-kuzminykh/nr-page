/**
 * What is open on the landing right now.
 *
 * The site grows one AI employee at a time: add an AI employee's number to OPEN_EMPLOYEES to open
 * its element; a department block opens as soon as one of its AI employees is open. Everything else
 * stays in the code, hidden, until it is opened here.
 *
 * Until all 100 AI employees are open, the FAQ answers for today; the full answers come back once
 * everything is open.
 *
 * (No imports here: the validation scripts read this file directly.)
 */

/** AI employees whose elements are open (1–100). */
export const OPEN_EMPLOYEES: readonly number[] = [1]

/** Blocks besides the departments. The hero, the platform and the final block are always open. */
export const OPEN_BLOCKS = {
  /** the periodic table of 100 AI employees */
  employees: false,
  /** custom use cases */
  custom: false,
  /** case articles (the block lists them; each opens once it is written) */
  cases: true,
  pricing: true,
  faq: true,
}

export const isEmployeeOpen = (n: number): boolean => OPEN_EMPLOYEES.includes(n)

/** All 100 AI employees are open: the whole product is on the site. */
export const ALL_EMPLOYEES_OPEN = OPEN_EMPLOYEES.length >= 100
