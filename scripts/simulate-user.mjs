// Simulated-user walkthrough: browses the landing the way people do — trackpad and
// wheel scrolling, clicking, typing, swiping on a phone, keyboard only — and records
// every step with a screenshot and an expectation.
//
// Usage:  npm run build && npm run preview
//         BASE_URL=http://127.0.0.1:4173/ npm run simulate
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { SLIDES } from '../src/data/slides.ts'

const require = createRequire(import.meta.url)
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  console.error('Playwright is required: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/'
const OUT = path.resolve('validation/walkthrough')
fs.mkdirSync(OUT, { recursive: true })
const LAUNCH = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
const steps = []
const errors = []
let shot = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const idx = (p) => p.evaluate(() => Number(document.querySelector('.slide[data-state="active"]')?.dataset.slide ?? -1))

async function step(page, persona, action, expect, ok, detail = '') {
  const file = `${String(++shot).padStart(3, '0')}-${persona}.jpg`
  await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 78 })
  steps.push({ persona, action, expect, ok: !!ok, detail, file })
  console.log(`${ok ? '✓' : '✗'} [${persona}] ${action} → ${expect}${detail ? ` (${detail})` : ''}`)
}

const watch = (page, who) => {
  page.on('pageerror', (e) => errors.push(`${who}: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${who}: ${m.text()}`))
}

// A trackpad flick: a burst of decaying deltas at 60 Hz, sent through the browser's input
// pipeline with evenly spaced timestamps — like an OS inertia stream, which keeps its timing
// even when the page is busy.
const cdps = new WeakMap()
const flick = async (page, dir = 1) => {
  if (!cdps.has(page)) cdps.set(page, await page.context().newCDPSession(page))
  const cdp = cdps.get(page)
  const { width, height } = page.viewportSize()
  const t0 = Date.now()
  for (let i = 0; i < 60; i++) {
    const wait = t0 + i * 16 - Date.now()
    if (wait > 0) await sleep(wait)
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: Math.round(width * 0.3),
      y: Math.round(height * 0.5),
      deltaX: 0,
      deltaY: dir * Math.max(1, 70 * Math.exp(-i / 14)),
      timestamp: (t0 + i * 16) / 1000,
    })
  }
}

const browser = await chromium.launch(LAUNCH)

const at = (id) => SLIDES.findIndex((s) => s.id === id)
const selName = (page) =>
  page.evaluate(() => document.querySelector('.slide[data-state="active"] .dept__el[aria-selected="true"]')?.dataset.name ?? null)
const waitFor = async (fn, ms = 4500) => {
  const t0 = Date.now()
  let v = await fn()
  while (!v && Date.now() - t0 < ms) {
    await sleep(150)
    v = await fn()
  }
  return v
}

/* ---------------------------------------------------------------- desktop visitor */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  watch(page, 'desktop')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1600)
  const hero = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('.hero__line > span')]
    const tops = spans.map((s) => s.getBoundingClientRect().top)
    return {
      word: [...document.querySelectorAll('.hero__ch')].map((c) => c.textContent).join(''),
      line: spans.map((s) => s.textContent.trim()).join(' '),
      oneLine: Math.max(...tops) - Math.min(...tops) < 6,
      logo: document.querySelector('.nav__brand')?.textContent.trim(),
    }
  })
  await step(
    page,
    'desktop',
    'Opens the site',
    'NEURONIUM; “Run AI Business with AI Operating System.” on one line; logo is just “Nr”',
    hero.word === 'NEURONIUM' && hero.line === 'Run AI Business with AI Operating System.' && hero.oneLine && hero.logo === 'Nr',
  )

  for (let i = 1; i < SLIDES.length; i++) {
    await flick(page, 1)
    await sleep(1500)
    const now = await idx(page)
    await step(page, 'desktop', `Trackpad flick #${i}`, `Exactly one block forward → ${SLIDES[i].label}`, now === i, `at ${now + 1}`)
  }
  await flick(page, -1)
  await sleep(1400)
  await step(page, 'desktop', 'Flicks back up once', `Returns to ${SLIDES[SLIDES.length - 2].label}`, (await idx(page)) === SLIDES.length - 2)
  await page.locator('.nav__brand').click()
  await sleep(1500)
  await step(page, 'desktop', 'Clicks the Nr logo', 'Back to the first block', (await idx(page)) === 0)

  // The periodic table of 100 AI employees
  await page.locator('.nav__item', { hasText: 'AI Employees' }).click()
  await sleep(1200)
  const activeNav = await page.locator('.nav__item.is-active').innerText()
  const t0 = await page.$eval('.pt__line.is-row .pt__label-name', (e) => e.textContent).catch(() => null)
  const t1 = await waitFor(() => page.$eval('.pt__line.is-row .pt__label-name', (e) => (e.textContent !== 'Management' ? e.textContent : null)).catch(() => null))
  await step(page, 'desktop', 'Clicks “AI Employees” in the menu and waits', 'The table of 100; the menu marks the section; the departments light up one by one, explained in a few words on the left', (await idx(page)) === at('employees') && activeNav === 'AI Employees' && t0 === 'Management' && t1 === 'HR', `${t0} → ${t1}`)
  await page.locator('.pt__cell[data-n="47"]').click()
  await sleep(350)
  const card = await page.locator('.emp__card').innerText()
  await step(page, 'desktop', 'Clicks element 47 (Lq)', 'A card: Lead Qualification in Sales, with its own description', card.includes('Lead Qualification') && card.includes('class of business') && /open sales/i.test(card))
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowRight')
  await sleep(400)
  const kb = await page.$eval('.pt__cell.is-sel', (e) => e.dataset.n)
  await step(page, 'desktop', 'Presses ↓ then → in the table', 'Moves to element 58 (Feature Request) without leaving the block', kb === '58' && (await idx(page)) === at('employees'), `selected ${kb}`)
  const search = page.getByRole('searchbox', { name: 'Search AI employees' })
  await search.fill('video')
  await sleep(400)
  const vid = await page.$$eval('.pt__cell.is-match', (els) => els.map((c) => c.dataset.name))
  await step(page, 'desktop', 'Searches “video”', 'Video Generation and Video Creation light up, the rest dims', vid.includes('Video Generation') && vid.includes('Video Creation'), vid.join(', '))
  await search.fill('qwerty')
  await sleep(300)
  const none = await page.locator('#emp-status').innerText()
  await step(page, 'desktop', 'Searches nonsense', 'A clear “Nothing matches” state', /Nothing matches/i.test(none))
  await search.press('Escape')
  await sleep(300)
  const back = await page.locator('#emp-status').innerText()
  await step(page, 'desktop', 'Presses Escape in the search', 'The whole table is back', back.trim() === '' && (await page.locator('.pt__cell.is-dim').count()) === 0)
  await page.locator('.pt__cell[data-n="63"]').click()
  await sleep(300)
  await page.locator('.emp__card').getByRole('button', { name: /Open Analytics/ }).click()
  await sleep(1600)
  const an = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return { i: Number(s.dataset.slide), sel: s.querySelector('.dept__el[aria-selected="true"]')?.dataset.name, doc: s.querySelector('.an-tab.is-on')?.textContent.trim() }
  })
  await step(page, 'desktop', 'Opens PRD (63), then “Open Analytics”', 'The Analytics block opens on PRD, with the PRD document in front', an.i === at('analytics') && an.sel === 'PRD' && an.doc === 'PRD', JSON.stringify(an))
  await page.evaluate(() => (location.hash = '#employees'))
  await sleep(1400)
  await page.locator('.pt__label', { hasText: 'Design' }).click()
  await sleep(600)
  const dc = await page.evaluate(() => ({
    row: document.querySelector('.pt__line.is-row .pt__label-name')?.textContent,
    dim: document.querySelectorAll('.pt.has-dept .pt__line:not(.is-row) .pt__cell').length,
    card: document.querySelector('.emp__card--dept')?.innerText ?? '',
  }))
  await step(page, 'desktop', 'Picks the “Design” department in the table', 'Its row lights up, the rest steps back; a card shows its headline and 10 AI employees', dc.row === 'Design' && dc.dim === 90 && /From design system/.test(dc.card), JSON.stringify({ row: dc.row, dim: dc.dim }))
  await page.locator('.emp__card--dept').getByRole('button', { name: /Open Design/ }).click()
  await sleep(1500)
  await step(page, 'desktop', 'Clicks “Open Design” on the card', 'Lands on the Design block', (await idx(page)) === at('design'))

  // A department block
  await page.locator('.nav__item', { hasText: /^Design/ }).click()
  await sleep(300)
  const ddOpen = await page.locator('.nav__panel').count()
  await page.keyboard.press('Escape')
  await sleep(200)
  const ddClosed = await page.locator('.nav__panel').count()
  await step(page, 'desktop', 'Opens the Departments menu, presses Escape', 'The menu shows the current department and closes on Escape', ddOpen === 1 && ddClosed === 0)
  await page.locator('.nav__item', { hasText: /^Design/ }).click()
  await sleep(300)
  await page.locator('.nav__dept', { hasText: 'Management' }).click()
  await sleep(1300)
  const a0 = await selName(page)
  const a1 = await waitFor(async () => {
    const n = await selName(page)
    return n !== a0 ? n : null
  }, 5000)
  const lit = await page.evaluate(() => document.querySelectorAll('.slide[data-state="active"] .dept__slot.is-focus .is-hot').length)
  await step(page, 'desktop', 'Opens Management from the menu and waits', 'AI employees play one after another; each lights up its own part of the interface', a0 === 'Knowledge Management' && a1 === 'Note Taking' && lit > 0, `${a0} → ${a1}`)
  await page.locator('.slide[data-state="active"] #tab-4').click()
  await sleep(400)
  const tm = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return {
      cap: s.querySelector('.dept__cap-name')?.textContent,
      auto: !!s.querySelector('.dept__strip.is-auto'),
      view: s.querySelector('.mgx')?.dataset.view,
      hot: s.querySelector('.dept__slot.is-focus .is-hot') !== null,
    }
  })
  await step(page, 'desktop', 'Clicks element 4 (Tm)', 'Autoplay stops; the interface turns to the task list made from the product', /Task Management/.test(tm.cap) && !tm.auto && tm.hot && tm.view === 'tasks', JSON.stringify(tm))
  await page.keyboard.press('ArrowRight')
  await sleep(300)
  const kbDept = await page.evaluate(() => ({ sel: document.querySelector('.slide[data-state="active"] .dept__el[aria-selected="true"]')?.dataset.name, focus: document.activeElement?.dataset.name }))
  await step(page, 'desktop', 'Presses → on the elements', 'The next AI employee (Process Management) is selected and focused; the block stays', kbDept.sel === 'Process Management' && kbDept.focus === 'Process Management' && (await idx(page)) === at('management'), JSON.stringify(kbDept))
  await page.locator('.nav__item', { hasText: /^Management/ }).click()
  await sleep(300)
  await page.locator('.nav__dept', { hasText: 'Engineering' }).click()
  await sleep(1500)
  const eng = await page.locator('.nav__dd .nav__item').innerText()
  await step(page, 'desktop', 'Picks Engineering in the Departments menu', 'Lands on Engineering; the menu says “Engineering”', (await idx(page)) === at('engineering') && eng.trim() === 'Engineering')

  // Platform: shared context and the Superagent
  await page.locator('.nav__item', { hasText: 'Platform' }).click()
  await sleep(5600)
  const brain = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.slide[data-state="active"] .cb-n')]
    return {
      lit: nodes.filter((n) => Number(n.children[3]?.getAttribute('opacity') ?? 0) > 0.5).length,
      way: document.querySelectorAll('.slide[data-state="active"] .cb line[display="inline"]').length,
    }
  })
  await step(page, 'desktop', 'Opens Platform and watches', 'A brain of tools: the Superagent runs along the connections and the tools light up one by one', brain.lit >= 4 && brain.way > 6, JSON.stringify(brain))

  // Use cases
  await page.locator('.nav__item', { hasText: 'Use cases' }).click()
  await sleep(1300)
  await page.getByRole('tab', { name: 'Investor Update' }).click()
  await sleep(3200)
  const uc = await page.evaluate(() => ({ n: document.querySelector('.cu__el-n')?.textContent, steps: document.querySelectorAll('.cu__step.is-in').length }))
  await step(page, 'desktop', 'Picks the “Investor Update” example', 'Element 102 builds itself step by step, reusing AI employees, with an approval step', uc.n === '102' && uc.steps >= 3, JSON.stringify(uc))

  // Pricing
  await page.locator('.nav__item', { hasText: 'Pricing' }).click()
  await sleep(1300)
  const prices = await page.$$eval('.pr-plan__price', (els) => els.map((e) => e.textContent))
  await step(page, 'desktop', 'Opens Pricing', 'Three plans; no invented prices', prices.length === 3 && prices.every((p) => p === 'Price on request'))
  await page.locator('.pr-plan.is-featured').getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(1500)
  await step(page, 'desktop', 'Clicks “Get Early Access” on the Company plan', 'Goes to the final block with the idea input', (await idx(page)) === at('start'))

  // FAQ
  await page.locator('.nav__item', { hasText: 'FAQ' }).click()
  await sleep(1300)
  await page.getByRole('tab', { name: /Is it available today/ }).click()
  await sleep(300)
  const faqA = await page.locator('#faq-answer .sr-only').innerText()
  await page.keyboard.press('ArrowDown')
  await sleep(300)
  const nextQ = await page.evaluate(() => document.activeElement?.textContent)
  await step(page, 'desktop', 'Asks “Is it available today?”, then presses ↓', 'Neuronium answers honestly (early access); ↓ moves to the next question, not the next block', /early access/i.test(faqA) && /How much does it cost/.test(nextQ || '') && (await idx(page)) === at('faq'), faqA.slice(0, 70))

  // Final: idea
  await page.locator('.nav__cta').click()
  await sleep(1600)
  const fin = page.locator('.slide[data-state="active"]')
  await fin.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(300)
  const empty = await page.locator('#fin-status').innerText()
  await step(page, 'desktop', 'Presses “Get Early Access” with an empty idea', 'Gently asked to write the idea first', /write a few words/i.test(empty))
  await fin.getByRole('textbox', { name: 'Your idea' }).fill('A marketplace where AI agents negotiate freight for small logistics companies')
  await fin.getByRole('textbox', { name: 'Your idea' }).press('Enter')
  await sleep(500)
  const sent = await page.locator('#fin-status').innerText()
  await step(page, 'desktop', 'Types an idea and presses Enter', 'A pre-filled email to the team opens (no fake “sent”)', /email app should open/i.test(sent))
  await fin.getByRole('button', { name: /Explore AI Employees/ }).click()
  await sleep(1500)
  await step(page, 'desktop', 'Clicks “Explore AI Employees”', 'Back on the periodic table', (await idx(page)) === at('employees'))
  await ctx.close()
}

/* ---------------------------------------------------------------- phone visitor */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  watch(page, 'phone')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1200)
  const line = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('.hero__line > span')]
    const tops = spans.map((s) => s.getBoundingClientRect().top)
    return { one: Math.max(...tops) - Math.min(...tops) < 6, right: Math.max(...spans.map((s) => s.getBoundingClientRect().right)), vw: innerWidth }
  })
  await step(page, 'phone', 'Opens the site on a phone', 'The tagline still fits on one line', line.one && line.right <= line.vw - 12, JSON.stringify(line))
  const cdp = await ctx.newCDPSession(page)
  const swipe = async (y0, y1, x = 195) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 5 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  for (let i = 1; i < SLIDES.length; i++) {
    // Like a person: swipe again if the first swipe only scrolled an inner area.
    let tries = 0
    while (tries < 4 && (await idx(page)) === i - 1) {
      await swipe(420, 120)
      await sleep(1300)
      tries++
    }
    const now = await idx(page)
    const fit = await page.evaluate(() => {
      const f = document.querySelector('.slide[data-state="active"] .slide__frame')
      return { over: f.scrollHeight - f.clientHeight, docX: document.documentElement.scrollWidth - innerWidth }
    })
    await step(page, 'phone', `Swipes up to block ${i + 1}`, `${SLIDES[i].label} within 3 swipes, no sideways scroll`, now === i && fit.docX <= 0 && tries <= 3, `${tries} swipe(s), inner overflow ${fit.over}px`)
  }
  await page.getByRole('button', { name: 'Open menu' }).tap()
  await sleep(500)
  await page.locator('.nav__sheet-dept', { hasText: 'Sales' }).tap()
  await sleep(1500)
  await step(page, 'phone', 'Opens the menu and taps Sales', 'The sheet closes and the Sales block opens', (await idx(page)) === at('sales') && (await page.locator('#nav-sheet').count()) === 0)
  await page.locator('.slide[data-state="active"] #tab-44').tap()
  await sleep(600)
  const ph = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    const vis = [...s.querySelectorAll('.dept__slot')].filter((x) => Number(getComputedStyle(x).opacity) > 0.5)
    return { cap: s.querySelector('.dept__cap-name')?.textContent, visible: vis.length, hot: !!vis[0]?.querySelector('.hot.is-hot') }
  })
  await step(page, 'phone', 'Taps element 44 (Sq)', 'One interface piece at a time: Personalized Sequences, its part lit', /Personalized Sequences/.test(ph.cap) && ph.visible === 1 && ph.hot, JSON.stringify(ph))
  await page.evaluate(() => (location.hash = '#employees'))
  await sleep(1400)
  const noCard = (await page.locator('.emp__card').count()) === 0
  await page.locator('.pt__cell[data-n="76"]').tap()
  await sleep(400)
  const card = await page.locator('.emp__card').innerText()
  await step(page, 'phone', 'Taps element 76', 'The table is clear until a tap; then a card with User Experience', noCard && card.includes('User Experience'))
  await page.locator('.emp__card').getByRole('button', { name: /Open Design/ }).tap()
  await sleep(1500)
  await step(page, 'phone', 'Taps “Open Design”', 'The Design block opens on User Experience', (await idx(page)) === at('design') && (await selName(page)) === 'User Experience')
  await page.evaluate(() => (location.hash = '#start'))
  await sleep(1400)
  await page.getByRole('textbox', { name: 'Your idea' }).tap()
  await page.keyboard.type('AI tutor for my language school')
  await step(page, 'phone', 'Types an idea on the phone', 'Input and button are comfortably reachable', (await page.getByRole('textbox', { name: 'Your idea' }).inputValue()).length > 10)
  await ctx.close()
}

/* ---------------------------------------------------------------- keyboard-only visitor */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  watch(page, 'keyboard')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1200)
  await page.keyboard.press('Tab')
  const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
  await page.keyboard.press('Tab')
  const logo = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  await page.keyboard.press('Tab')
  const menu = await page.evaluate(() => document.activeElement?.textContent?.trim())
  await page.keyboard.press('Enter')
  await sleep(1500)
  await step(page, 'keyboard', 'Tabs: skip link → logo → Platform, presses Enter', 'Opens the shared context block', /Skip/.test(first) && /Neuronium/.test(logo || '') && menu === 'Platform' && (await idx(page)) === at('context'), `${first} → ${logo} → ${menu}`)
  for (let i = 0; i < SLIDES.length; i++) {
    await page.keyboard.press('PageDown')
    await sleep(700)
  }
  await step(page, 'keyboard', 'Holds PageDown', 'Reaches the last block and stops there', (await idx(page)) === SLIDES.length - 1)
  // Focus is still on the menu item that was used; Tab goes through the menu, then straight into
  // the visible block — never into a hidden one.
  const last = String(SLIDES.length - 1)
  const trail = []
  for (let k = 0; k < 16 && trail[trail.length - 1] !== last; k++) {
    await page.keyboard.press('Tab')
    trail.push(
      await page.evaluate(() => {
        const a = document.activeElement
        return a?.closest('.slide')?.dataset.slide ?? (a?.closest('header, .skip-link') ? 'menu' : a?.tagName.toLowerCase())
      }),
    )
  }
  await step(page, 'keyboard', 'Keeps pressing Tab on the last block', 'Focus moves through the menu into the visible block; hidden blocks are never focused (inert)', trail.at(-1) === last && trail.every((t) => t === 'menu' || t === last), trail.join(' → '))
  await ctx.close()
}

await browser.close()

const ok = steps.filter((s) => s.ok).length
const md = [
  '# Simulated user walkthrough',
  '',
  `Run: ${new Date().toISOString()} · ${BASE}`,
  '',
  `**${ok} / ${steps.length} steps behaved as expected.** JavaScript errors: ${errors.length}.`,
  '',
  '| # | Visitor | Action | Expectation | Result | Screenshot |',
  '|---|---|---|---|---|---|',
  ...steps.map((s, i) => `| ${i + 1} | ${s.persona} | ${s.action} | ${s.expect} | ${s.ok ? '✅' : '❌'} ${s.detail.replace(/\|/g, '\\|')} | [${s.file}](./${s.file}) |`),
  '',
  errors.length ? `Errors:\n\n${errors.map((e) => `- ${e}`).join('\n')}` : '',
].join('\n')
fs.writeFileSync(path.join(OUT, 'README.md'), md)
console.log(`\n${ok}/${steps.length} steps OK, ${errors.length} JS errors → validation/walkthrough/README.md`)
process.exit(ok === steps.length && !errors.length ? 0 : 1)
