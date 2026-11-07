// Simulated-user walkthrough: browses the landing the way people do — trackpad and
// wheel scrolling, clicking, typing, swiping on a phone, keyboard only — and records
// every step with a screenshot and an expectation. While src/data/release.ts keeps blocks
// and AI employees closed, the visitors only go where the site is open.
//
// Usage:  npm run build && npm run preview
//         BASE_URL=http://127.0.0.1:4173/ npm run simulate
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { ALL_SLIDES, SLIDES } from '../src/data/slides.ts'
import { DEPARTMENTS } from '../src/data/departments.ts'
import { OPEN_EMPLOYEES } from '../src/data/release.ts'

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
fs.rmSync(OUT, { recursive: true, force: true })
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
const has = (id) => at(id) >= 0
const FULL = SLIDES.length === ALL_SLIDES.length && OPEN_EMPLOYEES.length === 100
const OPEN_DEPTS = DEPARTMENTS.filter((d) => has(d.id)).map((d) => ({ ...d, members: d.members.filter((m) => OPEN_EMPLOYEES.includes(m.n)) }))
const NAV_LABELS = [
  ['Platform', 'context'],
  ['AI Employees', 'employees'],
  [OPEN_DEPTS.length === 1 ? OPEN_DEPTS[0].name : 'Departments', OPEN_DEPTS[0]?.id],
  ['Use cases', 'custom'],
  ['Pricing', 'pricing'],
  ['FAQ', 'faq'],
]
  .filter(([, id]) => id && has(id))
  .map(([l]) => l)
// Opens a department from the menu: straight from the menu while it is the only one open.
const openDept = async (page, d) => {
  if (OPEN_DEPTS.length === 1) await page.locator('.nav__item', { hasText: d.name }).click()
  else {
    await page.locator('.nav__dd .nav__item').click()
    await sleep(300)
    await page.locator('.nav__dept', { hasText: d.name }).click()
  }
  await sleep(1500)
}
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

  if (FULL) {
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
  } else {
    // Staged release: only what is open is on the site
    const items = await page.$$eval('.nav__menu .nav__item', (els) => els.map((e) => e.textContent.trim()))
    await step(page, 'desktop', 'Looks at the menu', `Only the open sections: ${NAV_LABELS.join(' · ')}`, items.join('|') === NAV_LABELS.join('|'), items.join(' · '))
    for (const d of OPEN_DEPTS) {
      await openDept(page, d)
      const view = await page.evaluate(() => {
        const s = document.querySelector('.slide[data-state="active"]')
        return {
          els: [...s.querySelectorAll('.dept__el')].map((b) => b.dataset.name),
          title: [...s.querySelectorAll('.dept__title .mask')].map((x) => x.textContent.trim()).join(' '),
          active: document.querySelector('.nav__item.is-active')?.textContent.trim(),
        }
      })
      await step(
        page,
        'desktop',
        `Opens ${d.name} from the menu`,
        `Lands on ${d.name}; only its open AI employees are there (${d.members.map((m) => `${m.n} · ${m.symbol}`).join(', ')})`,
        (await idx(page)) === at(d.id) && view.active === d.name && view.els.join('|') === d.members.map((m) => m.name).join('|'),
        `${view.title} · menu: ${view.active}`,
      )
      const alone = d.members.length === 1
      if (d.id === 'management' && OPEN_EMPLOYEES.includes(1)) {
        if (!alone) {
          await page.locator('.slide[data-state="active"] #tab-1').click()
          await sleep(300)
        }
        const km = await page.evaluate(async (alone) => {
          const s = document.querySelector('.slide[data-state="active"]')
          const ask = () => s.querySelector(alone ? '.kq .prompt__q .sr-only' : '.mgx-search .sr-only')?.textContent.trim()
          const seen = []
          const t0 = performance.now()
          while (performance.now() - t0 < 12000 && seen.length < 2) {
            const q = ask()
            if (q && seen.at(-1) !== q) seen.push(q)
            await new Promise((r) => setTimeout(r, 150))
          }
          // let the second answer arrive
          await new Promise((r) => setTimeout(r, alone ? 4600 : 300))
          return {
            seen,
            answer: s.querySelector(alone ? '.kq-text' : '.mgx-answer p')?.textContent.trim(),
            sources: [...s.querySelectorAll(alone ? '.kq-src' : '.mgx-answer .mgx-src span')].map((x) => x.textContent.trim()),
          }
        }, alone)
        await step(
          page,
          'desktop',
          'Watches Knowledge Management (1 · Km)',
          alone
            ? 'A question is typed into the search bar at the bottom and answered above it, with the three things it was found in — then the next question'
            : 'It asks a question, answers it with its sources and the documents it was found in — then the next question',
          km.seen.length >= 2 && !!km.answer && km.sources.length === (alone ? 3 : 2),
          km.seen.join(' → '),
        )
      }
      const first = d.members[0]
      await page.locator(`.slide[data-state="active"] #tab-${first.n}`).click()
      await sleep(500)
      const sel = await page.evaluate(() => {
        const s = document.querySelector('.slide[data-state="active"]')
        return {
          cap: s.querySelector('.dept__cap-name')?.textContent,
          no: s.querySelector('.dept__cap-n')?.textContent,
          hot: !!s.querySelector('.dept__slot.is-focus .is-hot'),
          title: [...s.querySelectorAll('.dept__title .mask')].map((x) => x.textContent.trim()).join(' '),
          picked: s.querySelector('.dept__el[aria-selected="true"]')?.dataset.name,
          load: s.querySelectorAll('.dept__strip.is-live .dept__el-load').length,
        }
      })
      if (alone)
        await step(page, 'desktop', `Clicks element ${first.n} (${first.symbol})`, `${first.lead?.title ?? first.name} is the title; its element is picked and the line under it counts down to the next answer`, sel.title === (first.lead?.title ?? first.name) && sel.picked === first.name && sel.load === 1, JSON.stringify(sel))
      else
        await step(page, 'desktop', `Clicks element ${first.n} (${first.symbol})`, `“${first.n} · ${first.symbol}” above ${first.name}; its part of the interface is lit`, sel.cap === first.name && sel.no === `${first.n} · ${first.symbol}` && sel.hot, JSON.stringify(sel))
    }
  }

  // Platform: shared context and the Superagent
  await page.locator('.nav__item', { hasText: 'Platform' }).click()
  // a command is typed below the brain and sent; the agent sets off
  await page.waitForFunction(() => document.querySelectorAll('.slide[data-state="active"] .cb-n.is-on:not(.cb-n--core)').length >= 2, null, { timeout: 15000 }).catch(() => {})
  const brain = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return {
      cmd: s.querySelector('.prompt__q .sr-only')?.textContent.trim(),
      sent: !!s.querySelector('.prompt.is-sent'),
      on: [...s.querySelectorAll('.cb-n.is-on:not(.cb-n--core) .cb-lab')].map((x) => x.textContent),
      rest: s.querySelectorAll('.cb-n:not(.is-on)').length,
      icons: [...s.querySelectorAll('.cb-n')].filter((g) => Number(g.children[3]?.getAttribute('opacity') ?? 0) > 0.05).length,
      way: s.querySelectorAll('.cb line[display="inline"]').length,
    }
  })
  await step(page, 'desktop', 'Opens Platform and watches', 'A command is typed below the brain and sent; the Superagent runs its way and only the tools it needs appear', brain.sent && brain.on.length >= 2 && brain.rest >= 6 && brain.icons <= 6 && brain.way > 4, JSON.stringify(brain))

  if (has('custom')) {
    // Use cases
    await page.locator('.nav__item', { hasText: 'Use cases' }).click()
    await sleep(1300)
    await page.getByRole('tab', { name: 'Investor Update' }).click()
    await sleep(3200)
    const uc = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      return {
        n: s.querySelector('.cu__el-n')?.textContent,
        nodes: s.querySelectorAll('.fl-n').length,
        human: s.querySelectorAll('.fl-n--human').length,
        llm: s.querySelectorAll('.fl-n--llm').length,
      }
    })
    await step(page, 'desktop', 'Picks the “Investor Update” example', 'Element 102 is drawn as a node graph — system, LLM and a human approval — with data running through it', uc.n === '102' && uc.nodes === 7 && uc.human === 1 && uc.llm >= 2, JSON.stringify(uc))
  }

  if (has('pricing')) {
    // Pricing
    await page.locator('.nav__item', { hasText: 'Pricing' }).click()
    await sleep(1300)
    const plans = await page.$$eval('.pr-plan', (els) =>
      els.map((x) => ({
        name: x.querySelector('.pr-plan__name')?.textContent.trim(),
        price: x.querySelector('.pr-plan__price')?.textContent.replace(/\s+/g, ' ').trim(),
        cta: x.querySelector('.pr-plan__cta')?.textContent.trim(),
        href: x.querySelector('.pr-plan__cta')?.getAttribute('href') ?? '',
      })),
    )
    await step(
      page,
      'desktop',
      'Opens Pricing',
      'Standard $59, Solo $190, Business $890 and Enterprise — prices per month, nothing else around them',
      plans.map((p) => p.name).join('|') === 'Standard|Solo|Business|Enterprise' && /59/.test(plans[0]?.price) && /190/.test(plans[1]?.price) && /890/.test(plans[2]?.price) && plans[3]?.price === 'Custom',
      plans.map((p) => `${p.name} ${p.price}`).join(' | '),
    )
    const trial = plans.filter((p) => p.cta === 'Start Free Trial')
    const sales = plans.filter((p) => p.cta === 'Contact sales')
    await step(
      page,
      'desktop',
      'Looks at the buttons',
      '“Start Free Trial” on Standard, Solo and Business, “Contact sales” on Enterprise — each leads somewhere real (no fake sign-up)',
      trial.length === 3 && sales.length === 1 && plans.every((p) => /^(mailto:|https?:)/.test(p.href)) && trial.every((p) => p.href.toLowerCase().includes(p.name.toLowerCase())),
      plans.map((p) => `${p.cta} → ${p.href.slice(0, 48)}`).join(' | '),
    )
  }

  if (has('faq')) {
    // FAQ
    await page.locator('.nav__item', { hasText: 'FAQ' }).click()
    await sleep(1300)
    await page.getByRole('button', { name: /Is it available today/ }).click()
    await sleep(700)
    const faqA = await page.evaluate(() => ({
      open: document.querySelectorAll('.slide[data-state="active"] .faq__q[aria-expanded="true"]').length,
      text: document.querySelector('.slide[data-state="active"] .faq__item.is-open .faq__a')?.textContent ?? '',
    }))
    await page.keyboard.press('ArrowDown')
    await sleep(300)
    const nextQ = await page.evaluate(() => document.activeElement?.textContent)
    await step(page, 'desktop', 'Opens “Is it available today?”, then presses ↓', 'The answer opens in place and the other one closes (early access); ↓ moves to the next question, not the next block', faqA.open === 1 && /early access/i.test(faqA.text) && /How much does it cost/.test(nextQ || '') && (await idx(page)) === at('faq'), faqA.text.slice(0, 70))
  }

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
  if (has('employees')) {
    await fin.getByRole('button', { name: /Explore AI Employees/ }).click()
    await sleep(1500)
    await step(page, 'desktop', 'Clicks “Explore AI Employees”', 'Back on the periodic table', (await idx(page)) === at('employees'))
  } else {
    const link = await fin.getByRole('button', { name: /Explore AI Employees/ }).count()
    await step(page, 'desktop', 'Looks for a way to the AI employees table', 'There is none while the table is closed — no dead link', link === 0)
  }
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
  if (FULL) {
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
  } else if (OPEN_DEPTS.length) {
    const d = OPEN_DEPTS[0]
    const m = d.members[0]
    await page.getByRole('button', { name: 'Open menu' }).tap()
    await sleep(500)
    await page.locator(OPEN_DEPTS.length === 1 ? '.nav__sheet-item' : '.nav__sheet-dept', { hasText: d.name }).tap()
    await sleep(1500)
    await step(page, 'phone', `Opens the menu and taps ${d.name}`, `The sheet closes and the ${d.name} block opens`, (await idx(page)) === at(d.id) && (await page.locator('#nav-sheet').count()) === 0)
    await page.locator(`.slide[data-state="active"] #tab-${m.n}`).tap()
    await sleep(600)
    const ph = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      const f = s.querySelector('.slide__frame')
      const vis = [...s.querySelectorAll('.dept__slot')].filter((x) => Number(getComputedStyle(x).opacity) > 0.5)
      const scene = s.querySelector('.mgx')
      return {
        cap: s.querySelector('.dept__cap-name')?.textContent,
        title: [...s.querySelectorAll('.dept__title .mask')].map((x) => x.textContent.trim()).join(' '),
        visible: vis.length || (scene ? 1 : 0) || s.querySelectorAll('.dept__solo > *').length,
        hot: !!s.querySelector('.is-hot'),
        search: !!s.querySelector('.kq .prompt'),
        over: f.scrollHeight - f.clientHeight,
      }
    })
    if (d.members.length === 1)
      await step(page, 'phone', `Taps element ${m.n} (${m.symbol})`, `${m.lead?.title ?? m.name} on its own: the search, what it does, its element — all on one screen`, ph.title === (m.lead?.title ?? m.name) && ph.visible === 1 && (d.id !== 'management' || ph.search) && ph.over <= 0, JSON.stringify(ph))
    else
      await step(page, 'phone', `Taps element ${m.n} (${m.symbol})`, `One interface at a time: ${m.name}, its part lit`, ph.cap === m.name && ph.visible === 1 && ph.hot, JSON.stringify(ph))
  }
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
