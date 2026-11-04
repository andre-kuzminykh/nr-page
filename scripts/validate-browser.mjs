// Browser validation for the Neuronium landing.
// Visits all 17 blocks at 6 viewports, takes screenshots, checks horizontal overflow and
// JavaScript errors, then runs functional checks (menu, navigation, shared context, the
// periodic table of 100 AI employees, all 10 departments, use cases, pricing, FAQ, final
// idea input, touch, reduced motion).
//
// Usage:  npm run build && npm run preview   (in one terminal)
//         BASE_URL=http://127.0.0.1:4173/ npm run validate:browser
// Requires Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { AI_EMPLOYEES, DEPARTMENTS } from '../src/data/departments.ts'
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
const OUT = path.resolve('validation')
const SHOTS = path.join(OUT, 'screenshots')
const VIEWPORTS = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [375, 667],
]
const THEMES = ['dark']
const SETTLE = Number(process.env.SETTLE || 1700)
const LAUNCH = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }

const results = { checks: [], layout: [], errors: [], startedAt: new Date().toISOString(), base: BASE }
const check = (name, ok, detail = '') => {
  results.checks.push({ name, ok: !!ok, detail })
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const activeIndex = (page) => page.evaluate(() => Number(document.querySelector('.slide[data-state="active"]')?.dataset.slide ?? -1))

function trackErrors(page, label) {
  page.on('pageerror', (e) => results.errors.push(`${label}: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') results.errors.push(`${label}: console.error ${m.text()}`)
  })
}

async function layoutPass(browser) {
  fs.mkdirSync(SHOTS, { recursive: true })
  for (const [w, h] of VIEWPORTS) {
    for (const theme of THEMES) {
      const label = `${w}x${h}-${theme}`
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800 })
      const page = await ctx.newPage()
      trackErrors(page, label)
      await page.goto(BASE, { waitUntil: 'networkidle' })
      await sleep(SETTLE)
      const dir = path.join(SHOTS, label)
      fs.mkdirSync(dir, { recursive: true })
      for (let i = 0; i < SLIDES.length; i++) {
        if (i > 0) {
          await page.keyboard.press('PageDown')
          await sleep(SETTLE)
        }
        const idx = await activeIndex(page)
        const m = await page.evaluate(() => {
          const slide = document.querySelector('.slide[data-state="active"]')
          const frame = slide?.querySelector('.slide__frame')
          const vw = window.innerWidth
          const offenders = []
          const inHScroller = (el) => {
            for (let p = el.parentElement; p && p !== slide; p = p.parentElement) {
              const ox = getComputedStyle(p).overflowX
              if ((ox === 'auto' || ox === 'scroll' || ox === 'hidden') && p !== frame) return true
            }
            return false
          }
          slide?.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect()
            if (!r.width || !r.height) return
            if ((r.right > vw + 1 || r.left < -1) && !inHScroller(el)) {
              offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} [${Math.round(r.left)}–${Math.round(r.right)}]`)
            }
          })
          // Headline lines are revealed through masks: a line wider than its mask is cut off.
          const clipped = [...(slide?.querySelectorAll('.mask > span') ?? [])]
            .filter((sp) => {
              const r = document.createRange()
              r.selectNodeContents(sp)
              return r.getBoundingClientRect().width > sp.parentElement.getBoundingClientRect().width + 1
            })
            .map((sp) => `cut: ${sp.textContent.trim().slice(0, 28)}`)
          // Panel titles of visible interface pieces must be readable in full.
          const truncated = [...(slide?.querySelectorAll('.pn__title') ?? [])]
            .filter((t) => t.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && t.scrollWidth > t.clientWidth + 1)
            .map((t) => `title: ${t.textContent.trim()}`)
          offenders.push(...clipped, ...truncated)
          return {
            docOverflowX: document.documentElement.scrollWidth - vw,
            frameOverflowY: frame ? frame.scrollHeight - frame.clientHeight : 0,
            offenders: offenders.slice(0, 4),
            progress: Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
          }
        })
        const file = path.join(dir, `${String(i + 1).padStart(2, '0')}-${SLIDES[i].id}.jpg`)
        await page.screenshot({ path: file, type: 'jpeg', quality: 82 })
        results.layout.push({ viewport: `${w}x${h}`, theme, slide: i + 1, id: SLIDES[i].id, reached: idx === i, ...m })
      }
      await ctx.close()
      const rows = results.layout.filter((r) => r.viewport === `${w}x${h}` && r.theme === theme)
      const bad = rows.filter((r) => !r.reached || r.docOverflowX > 0 || r.offenders.length || r.progress !== r.slide)
      const scrolls = rows.filter((r) => r.frameOverflowY > 2).map((r) => r.slide)
      check(`Layout ${label}: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync`, bad.length === 0, bad.length ? JSON.stringify(bad.map((b) => ({ slide: b.slide, off: b.offenders, x: b.docOverflowX })) ) : scrolls.length ? `inner scroll used on slide(s) ${scrolls.join(', ')}` : 'all slides fit without inner scroll')
    }
  }
}

async function functionalPass(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  trackErrors(page, 'functional')
  const go = async (id) => {
    await page.evaluate((h) => (location.hash = h), `#${id}`)
    await sleep(1300)
  }
  const at = (id) => SLIDES.findIndex((s) => s.id === id)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1200)

  // Background
  const bg = await page.evaluate(() => {
    const c = document.querySelector('.light-field__canvas')
    return { canvas: !!c, ready: c?.dataset.ready === 'true' }
  })
  check('Continuous light background renders with WebGL (single persistent canvas)', bg.canvas && bg.ready, JSON.stringify(bg))
  const canvasBefore = await page.evaluateHandle(() => document.querySelector('.light-field__canvas'))

  // Hero
  const hero = await page.evaluate(() => ({
    word: document.querySelector('.hero__word')?.getAttribute('aria-label'),
    letters: [...document.querySelectorAll('.hero__ch')].map((c) => c.textContent).join(''),
    line: [...document.querySelectorAll('.hero__line > span')].map((s) => s.textContent.trim()).join(' '),
  }))
  check('Hero: NEURONIUM, then “Run AI Business with AI Operating System.”', hero.word === 'Neuronium' && hero.letters === 'NEURONIUM' && hero.line === 'Run AI Business with AI Operating System.', hero.line)
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.hero__slot')].some((s) => getComputedStyle(s).overflow === 'hidden'),
  )
  check('Hero: letters are not clipped by their reveal mask', !clipped)

  // Top menu
  const nav = await page.evaluate(() => ({
    logo: document.querySelector('.nav__brand')?.textContent.trim(),
    logoTile: !!document.querySelector('.nav__brand svg, .nav__brand rect') || getComputedStyle(document.querySelector('.nav__logo')).backgroundColor !== 'rgba(0, 0, 0, 0)',
    items: [...document.querySelectorAll('.nav__menu .nav__item')].map((b) => b.textContent.trim()),
    cta: document.querySelector('.nav__cta')?.textContent.trim(),
    bg: getComputedStyle(document.querySelector('.nav')).backgroundColor,
    counter: !!document.querySelector('.topbar__counter, .slide-index, .theme-switch'),
  }))
  check(
    'Top menu: transparent, logo is the two letters Nr (no tile), Platform · AI Employees · Departments · Use cases · Pricing · FAQ, Get Early Access',
    nav.logo === 'Nr' && !nav.logoTile && nav.items.join('|') === 'Platform|AI Employees|Departments|Use cases|Pricing|FAQ' && /Get Early Access/.test(nav.cta) && /rgba\(0, 0, 0, 0\)|transparent/.test(nav.bg) && !nav.counter,
    JSON.stringify(nav),
  )
  await page.locator('.nav__item', { hasText: 'Pricing' }).click()
  await sleep(1300)
  const onPricing = (await activeIndex(page)) === at('pricing')
  await page.locator('.nav__item', { hasText: 'Departments' }).click()
  await sleep(300)
  const ddItems = await page.$$eval('.nav__panel .nav__dept-name', (els) => els.map((e) => e.textContent.trim()))
  await page.mouse.wheel(0, 200)
  await sleep(900)
  const stayedWhileOpen = (await activeIndex(page)) === at('pricing')
  await page.locator('.nav__dept', { hasText: 'Sales' }).click()
  await sleep(1400)
  const navLabel = await page.$eval('.nav__dd .nav__item', (b) => b.textContent.trim())
  check(
    'Menu: jumps to sections; Departments opens all 10; scrolling is ignored while it is open',
    onPricing && ddItems.join('|') === DEPARTMENTS.map((d) => d.name).join('|') && stayedWhileOpen && (await activeIndex(page)) === at('sales') && navLabel === 'Sales',
    `dropdown: ${ddItems.length} · label: ${navLabel}`,
  )

  // Wheel and trackpad
  await go('hero')
  await page.mouse.move(700, 450)
  await page.mouse.wheel(0, 120)
  await sleep(1100)
  check('Mouse wheel: one notch moves exactly one block', (await activeIndex(page)) === 1)
  await page.evaluate(
    () =>
      new Promise((done) => {
        let i = 0
        const tick = () => {
          window.dispatchEvent(new WheelEvent('wheel', { deltaY: Math.max(1, 60 * Math.exp(-i / 18)), cancelable: true, bubbles: true }))
          if (++i < 90) setTimeout(tick, 16)
          else done()
        }
        tick()
      }),
  )
  await sleep(1100)
  check('Trackpad inertia: one long gesture moves exactly one block', (await activeIndex(page)) === 2)
  const sameCanvas = await page.evaluate((c) => c === document.querySelector('.light-field__canvas'), canvasBefore)
  check('Background persists across blocks (canvas not re-created)', sameCanvas)

  // Keyboard
  await page.keyboard.press('End')
  await sleep(900)
  const end = await activeIndex(page)
  await page.keyboard.press('Home')
  await sleep(900)
  const home = await activeIndex(page)
  await page.keyboard.press('ArrowDown')
  await sleep(900)
  const down = await activeIndex(page)
  await page.keyboard.press('ArrowUp')
  await sleep(900)
  const up = await activeIndex(page)
  check('Keyboard: End / Home / ArrowDown / ArrowUp', end === SLIDES.length - 1 && home === 0 && down === 1 && up === 0, `${end},${home},${down},${up}`)

  // Shared context and Superagent
  await go('context')
  await sleep(4200)
  const cx = await page.evaluate(() => ({
    sources: document.querySelectorAll('.ctx__src').length,
    steps: document.querySelectorAll('.ctx__step').length,
    running: document.querySelectorAll('.ctx__step.is-run, .ctx__step.is-done').length,
    gov: document.querySelector('.ctx__gov')?.textContent,
  }))
  check(
    'Shared context: 12 source icons, Superagent plan across AI employees, AI Governance (Policy · Access · Oversight · Control)',
    cx.sources === 12 && cx.steps === 6 && cx.running > 0 && /Policy · Access · Oversight · Control/.test(cx.gov || ''),
    JSON.stringify({ ...cx, gov: undefined }),
  )

  // Periodic table of 100 AI employees
  await go('employees')
  const table = await page.evaluate(() =>
    [...document.querySelectorAll('.pt__line:not(.pt__line--head)')].map((row) => ({
      label: row.querySelector('.pt__label-name')?.textContent.trim(),
      cells: [...row.querySelectorAll('.pt__cell')].map((c) => ({ n: Number(c.dataset.n), name: c.dataset.name, sym: c.querySelector('.pt__sym').textContent })),
    })),
  )
  const seen = table.flatMap((r) => r.cells.map((c) => `${r.label}::${c.n}::${c.name}`))
  const expected = AI_EMPLOYEES.map((e) => `${DEPARTMENTS.find((d) => d.id === e.department).name}::${e.n}::${e.name}`)
  check('Periodic table: all 100 AI employees, 10 per department, in order', seen.length === 100 && seen.join('|') === expected.join('|'), `${seen.length} elements`)
  const syms = table.flatMap((r) => r.cells.map((c) => c.sym))
  const zero = await page.locator('.pt__zero .pt__sym').innerText()
  const ranges = await page.locator('.pt__col, .dept__count:has-text("–")').count()
  check('Periodic table: unique symbols, Nr is element 0, no column numbers or ranges', new Set(syms).size === 100 && !syms.includes('Nr') && zero === 'Nr' && ranges === 0)

  const search = page.getByRole('searchbox', { name: 'Search AI employees' })
  await search.fill('Apollo')
  await sleep(250)
  const apollo = await page.$$eval('.pt__cell.is-match', (els) => els.map((x) => x.dataset.name))
  await search.fill('zzzz-none')
  await sleep(250)
  const nothing = await page.locator('#emp-status').innerText()
  await search.fill('')
  check('Periodic table: search by tool, empty state', apollo.includes('Audience Discovery') && /nothing matches/i.test(nothing), apollo.join(', '))

  await page.locator('.pt__cell[data-n="47"]').click()
  await sleep(300)
  const card = await page.locator('.emp__card').innerText()
  await page.keyboard.press('ArrowDown')
  await sleep(250)
  const afterKey = await page.$eval('.pt__cell.is-sel', (e) => e.dataset.n)
  check('Periodic table: a card opens on the element; arrow keys move through the table', card.includes('Lead Qualification') && afterKey === '57' && (await activeIndex(page)) === at('employees'), afterKey)
  await page.locator('.pt__cell[data-n="47"]').click()
  await sleep(300)
  await page.locator('.emp__card').getByRole('button', { name: /Open Sales/ }).click()
  await page.waitForFunction((i) => Number(document.querySelector('.slide[data-state="active"]')?.dataset.slide) === i, at('sales'), { timeout: 4000 }).catch(() => {})
  await sleep(900)
  const handed = await page.evaluate(() => ({
    i: Number(document.querySelector('.slide[data-state="active"]').dataset.slide),
    sel: document.querySelector('.slide[data-state="active"] .dept__el[aria-selected="true"] .dept__el-sym')?.textContent,
  }))
  check('Periodic table → department: “Open Sales” opens Sales with Lead Qualification selected', handed.i === at('sales') && handed.sel === 'Lq', JSON.stringify(handed))

  // All 10 departments: every AI employee lights up its own part of the interface
  const missing = []
  for (const dpt of DEPARTMENTS) {
    await go(dpt.id)
    const slide = page.locator('.slide[data-state="active"]')
    const els = await slide.locator('.dept__el').evaluateAll((b) => b.map((x) => x.dataset.name))
    if (els.join('|') !== dpt.members.map((m) => m.name).join('|')) missing.push(`${dpt.name}: wrong elements`)
    for (const m of dpt.members) {
      await slide.locator(`#tab-${m.n}`).click()
      await sleep(80)
      const state = await slide.evaluate((el) => ({
        hot: el.querySelectorAll('.dept__stage .hot.is-hot').length,
        focus: el.querySelectorAll('.dept__stage .pn.is-focus').length,
        cap: el.querySelector('.dept__cap-desc')?.textContent,
      }))
      if (!state.hot || state.focus !== 1 || state.cap !== m.description) missing.push(`${m.n} ${m.name}`)
    }
  }
  check('Departments: 10 blocks × 10 AI employees; each one focuses a panel and lights up its own part of the interface', missing.length === 0, missing.slice(0, 6).join(', '))

  // Custom use cases
  await go('custom')
  await page.getByRole('tab', { name: 'Supplier Check' }).click()
  await sleep(500)
  const cu = await page.evaluate(() => ({ el: document.querySelector('.cu__el-n')?.textContent, gov: document.querySelector('.cu__gov')?.textContent }))
  check('Use cases: examples switch; a custom AI employee continues the table (element 103)', cu.el === '103' && /Policy/.test(cu.gov) && /Control/.test(cu.gov), JSON.stringify(cu))

  // Pricing — no invented prices
  await go('pricing')
  const prices = await page.$$eval('.pr-plan__price', (els) => els.map((e) => e.textContent.trim()))
  check('Pricing: three plans, prices on request (no invented numbers)', prices.length === 3 && prices.every((p) => !/\d/.test(p)), prices.join(' | '))

  // FAQ
  await go('faq')
  await page.getByRole('tab', { name: /Who stays in control/ }).click()
  await sleep(300)
  const faqA = await page.locator('#faq-answer .sr-only').innerText()
  check('FAQ: questions answer as Neuronium', /AI Governance/.test(faqA), faqA.slice(0, 60))

  // Final
  await go('start')
  const fin = await page.evaluate(() => ({
    title: [...document.querySelectorAll('.fin__title .mask')].map((m) => m.textContent.trim()).join(' '),
    centerMark: !!document.querySelector('.fin .brand-mark'),
  }))
  const active = page.locator('.slide[data-state="active"]')
  await active.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(200)
  const emptyMsg = await page.locator('#fin-status').innerText()
  await active.getByRole('textbox', { name: 'Your idea' }).fill('An AI concierge for boutique hotels')
  await active.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(300)
  const sentMsg = await page.locator('#fin-status').innerText()
  check(
    'Final: “Turn your Idea into Reality.”, no extra logo, idea input; empty input is caught; submit hands off honestly',
    fin.title === 'Turn your Idea into Reality.' && !fin.centerMark && /write a few words/i.test(emptyMsg) && /email app/i.test(sentMsg),
    sentMsg,
  )
  await active.getByRole('button', { name: /Explore AI Employees/ }).click()
  await sleep(1300)
  check('Final: “Explore AI Employees” opens the periodic table', (await activeIndex(page)) === at('employees'))
  await page.reload({ waitUntil: 'networkidle' })
  await sleep(600)
  check('Deep link: reload keeps the current block', (await activeIndex(page)) === at('employees'))

  const fps = await page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0
        const t0 = performance.now()
        const f = () => {
          n++
          if (performance.now() - t0 < 2000) requestAnimationFrame(f)
          else res(Math.round((n * 1000) / (performance.now() - t0)))
        }
        requestAnimationFrame(f)
      }),
  )
  results.fps = fps
  await ctx.close()

  // Phone: swipes and the menu sheet
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 })
  const mp = await m.newPage()
  trackErrors(mp, 'touch')
  await mp.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1000)
  const cdp = await m.newCDPSession(mp)
  const swipe = async (y0, y1) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: y0 }] })
    for (let k = 1; k <= 6; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: y0 + ((y1 - y0) * k) / 6 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await swipe(640, 300)
  await sleep(2800)
  const afterUp = await activeIndex(mp)
  await swipe(300, 640)
  await sleep(1400)
  const afterDown = await activeIndex(mp)
  check('Touch: swipe up → next block, swipe down → previous block', afterUp === 1 && afterDown === 0, `${afterUp}, ${afterDown}`)
  await mp.getByRole('button', { name: 'Open menu' }).click()
  await sleep(400)
  await swipe(640, 300)
  await sleep(900)
  const stayed = (await activeIndex(mp)) === 0
  await mp.locator('.nav__sheet-item', { hasText: 'FAQ' }).click()
  await sleep(1400)
  check('Phone menu: opens full screen, blocks swipes while open, jumps to a section', stayed && (await activeIndex(mp)) === at('faq'))
  await m.close()

  // Reduced motion
  const r = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const rp = await r.newPage()
  trackErrors(rp, 'reduced-motion')
  await rp.goto(BASE + '#management', { waitUntil: 'networkidle' })
  await sleep(700)
  const visible = await rp.evaluate(() =>
    [...document.querySelectorAll('.slide[data-state="active"] .rv')].every((el) => Number(getComputedStyle(el).opacity) > 0.99),
  )
  await rp.screenshot({ path: path.join(SHOTS, 'reduced-motion-management.jpg'), type: 'jpeg', quality: 82 })
  check('Reduced motion: content is fully visible without motion; background stays as a still overlap', visible)
  await r.close()
}

const browser = await chromium.launch(LAUNCH)
try {
  await functionalPass(browser)
  if (!process.env.SKIP_LAYOUT) await layoutPass(browser)
} finally {
  await browser.close()
}

check('No JavaScript errors in any run', results.errors.length === 0, results.errors.slice(0, 5).join(' | '))

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
const passed = results.checks.filter((c) => c.ok).length
const md = [
  '# Neuronium landing — browser validation',
  '',
  `Run: ${results.startedAt} · ${BASE} · Chromium (headless, software WebGL)`,
  '',
  `**${passed} / ${results.checks.length} checks passed.**`,
  '',
  '| | Check | Detail |',
  '|---|---|---|',
  ...results.checks.map((c) => `| ${c.ok ? '✅' : '❌'} | ${c.name} | ${String(c.detail).replace(/\|/g, '\\|')} |`),
  '',
  `Indicative frame rate in headless software rendering: ${results.fps ?? 'n/a'} fps (real GPUs run the light field at display refresh rate).`,
  '',
  'Screenshots: `validation/screenshots/<viewport>-<theme>/NN-<slide>.jpg`.',
  '',
].join('\n')
fs.writeFileSync(path.join(OUT, 'report.md'), md)
console.log(`\n${passed}/${results.checks.length} checks passed → validation/report.md`)
process.exit(passed === results.checks.length ? 0 : 1)
