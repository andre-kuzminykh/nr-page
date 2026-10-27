// Browser validation for the Neuronium landing.
// Visits all 12 slides at 6 viewports (dark theme only), takes screenshots, checks horizontal
// overflow and JavaScript errors, then runs functional checks (navigation, architecture,
// AI Employees, catalog, configuration, touch, reduced motion).
//
// Usage:  npm run build && npm run preview   (in one terminal)
//         BASE_URL=http://127.0.0.1:4173/ npm run validate:browser
// Requires Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { CAPABILITIES, EMPLOYEES } from '../src/data/employees.ts'
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
      check(`Layout ${label}: 12 slides reached by keyboard, no horizontal overflow, progress in sync`, bad.length === 0, bad.length ? JSON.stringify(bad.map((b) => ({ slide: b.slide, off: b.offenders, x: b.docOverflowX })) ) : scrolls.length ? `inner scroll used on slide(s) ${scrolls.join(', ')}` : 'all slides fit without inner scroll')
    }
  }
}

async function functionalPass(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  const page = await ctx.newPage()
  trackErrors(page, 'functional')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1200)

  // Background
  const bg = await page.evaluate(() => {
    const c = document.querySelector('.light-field__canvas')
    return { canvas: !!c, ready: c?.dataset.ready === 'true', fallback: !!document.querySelector('.light-field__fallback') }
  })
  check('Continuous light background renders with WebGL (single persistent canvas)', bg.canvas && bg.ready, JSON.stringify(bg))
  const canvasBefore = await page.evaluateHandle(() => document.querySelector('.light-field__canvas'))

  // Wheel: one notch = one slide
  await page.mouse.move(700, 450)
  await page.mouse.wheel(0, 120)
  await sleep(1100)
  check('Mouse wheel: one notch moves exactly one slide', (await activeIndex(page)) === 1)

  // Trackpad: a long inertial gesture still moves only one slide
  // Dispatched in-page at a real 16 ms cadence (driver round-trips would add artificial pauses).
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
  check('Trackpad inertia: one long gesture moves exactly one slide', (await activeIndex(page)) === 2)

  const sameCanvas = await page.evaluate((c) => c === document.querySelector('.light-field__canvas'), canvasBefore)
  check('Background persists across slides (canvas not re-created)', sameCanvas)

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
  check('Keyboard: End / Home / ArrowDown / ArrowUp', end === 11 && home === 0 && down === 1 && up === 0, `${end},${home},${down},${up}`)

  // Hero CTA
  await page.getByRole('button', { name: 'Explore Neuronium' }).click()
  await sleep(1300)
  check('Hero CTA "Explore Neuronium" opens the architecture', (await activeIndex(page)) === 2)

  // Architecture
  const arch = await page.evaluate(() => {
    const os = document.querySelector('.arch__os')
    const gov = document.querySelector('.arch__gov')
    const biz = document.querySelector('.arch__biz')
    const native = document.querySelector('.arch__type--native')
    const first = document.querySelector('.arch__type--first')
    const tiles = [...document.querySelectorAll('.arch__tile')]
    const rows = {}
    tiles.forEach((t) => {
      const y = t.offsetTop
      ;(rows[y] ||= []).push(t.textContent.trim())
    })
    return {
      govInsideOS: !!(os && gov && os.contains(gov)),
      govFunctions: [...document.querySelectorAll('.arch__gov-list li')].map((l) => l.textContent.trim()),
      comps: [...document.querySelectorAll('.arch__comp-name')].map((c) => c.textContent.trim()),
      bizBelowOS: biz.getBoundingClientRect().top > os.getBoundingClientRect().bottom,
      nativeAboveFirst: native.getBoundingClientRect().bottom <= first.getBoundingClientRect().top + 1,
      rows: Object.values(rows),
      exec: [...document.querySelectorAll('.arch__exec .exec-line__item')].map((e) => e.textContent.trim()),
    }
  })
  check('Architecture: AI Governance (Policy, Access, Oversight, Control) is inside the Neuronium block', arch.govInsideOS && arch.govFunctions.join() === 'Policy,Access,Oversight,Control')
  check('Architecture: AI Business = AI Identity | AI Knowledge Graph | AI Superagent', arch.bizBelowOS && arch.comps.join('|') === 'AI Identity|AI Knowledge Graph|AI Superagent')
  check('Architecture: AI-Native is above AI-First', arch.nativeAboveFirst)
  check(
    'Architecture: AI-First grid is 2×5 in the approved order (Management first tile)',
    arch.rows.length === 2 &&
      arch.rows[0].join() === 'Management,HR,Marketing,SMM,Sales' &&
      arch.rows[1].join() === 'Support,Analytics,Design,Development,Engineering',
    JSON.stringify(arch.rows),
  )
  check('Architecture: one slim line AI Agents · AI Workflows · AI Skills', arch.exec.join() === 'AI Agents,AI Workflows,AI Skills')

  // AI Employees
  await page.evaluate(() => (location.hash = '#employees'))
  await sleep(1300)
  const emp = await page.evaluate(() => ({
    tabs: [...document.querySelectorAll('.emp__tile .emp__name')].map((t) => t.textContent.trim()),
    selected: document.querySelector('.emp__tile[aria-selected="true"] .emp__name')?.textContent.trim(),
  }))
  check('AI Employees: 10 tiles in order, Management selected by default', emp.tabs.length === 10 && emp.tabs[0] === 'Management' && emp.selected === 'Management')
  await page.getByRole('tab', { name: /HR/ }).click()
  await sleep(400)
  const hrPanel = await page.locator('#emp-panel').innerText()
  await page.keyboard.press('ArrowRight')
  await sleep(300)
  const afterArrow = await page.evaluate(() => document.querySelector('.emp__tile[aria-selected="true"] .emp__name')?.textContent.trim())
  check('AI Employees: click and arrow keys change the responsibility panel', hrPanel.includes('Job Description') && afterArrow === 'Marketing', `after ArrowRight: ${afterArrow}`)
  check('AI Employees: arrow keys inside the grid do not change the slide', (await activeIndex(page)) === 4)

  // Capabilities catalog — periodic table
  await page.evaluate(() => (location.hash = '#capabilities'))
  await sleep(1400)
  const table = await page.evaluate(() =>
    [...document.querySelectorAll('.pt__line:not(.pt__line--head)')].map((row) => ({
      label: row.querySelector('.pt__label-name')?.textContent.trim(),
      cells: [...row.querySelectorAll('.pt__cell')].map((c) => ({ n: Number(c.dataset.n), name: c.dataset.name, sym: c.querySelector('.pt__sym').textContent })),
    })),
  )
  const seen = table.flatMap((r) => r.cells.map((c) => `${r.label}::${c.n}::${c.name}`))
  const expected = CAPABILITIES.map((c) => `${EMPLOYEES.find((e) => e.id === c.employee).name}::${c.n}::${c.name}`)
  check('Catalog: periodic table holds all 100 elements, 10 per AI Employee, in order', seen.length === 100 && seen.join('|') === expected.join('|'), `${seen.length} elements`)
  const syms = table.flatMap((r) => r.cells.map((c) => c.sym))
  const zero = await page.locator('.pt__zero .pt__sym').innerText()
  check('Catalog: every element has a unique symbol; Nr is element 0', new Set(syms).size === 100 && !syms.includes('Nr') && zero === 'Nr')

  const search = page.getByRole('searchbox', { name: 'Search capabilities' })
  await search.fill('Apollo')
  await sleep(250)
  const apollo = await page.$$eval('.pt__cell.is-match', (els) => els.map((x) => x.dataset.name))
  await search.fill('zzzz-none')
  await sleep(250)
  const nothing = await page.locator('#cat-status').innerText()
  await search.fill('management')
  await sleep(250)
  const many = await page.$$eval('.pt__cell.is-match', (els) => els.length)
  check('Catalog search: finds by tool name, shows an empty state, searches across categories', apollo.includes('Audience Discovery') && /nothing matches/i.test(nothing) && many > 10, `apollo→${apollo.join(', ')}; "management"→${many}`)
  await search.fill('')
  await page.locator('.pt__cell[data-n="1"]').click()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowRight')
  await sleep(250)
  const sel = await page.$eval('.pt__cell.is-sel', (e) => e.dataset.name)
  const detail = await page.locator('.cat__detail').innerText()
  check('Catalog: arrow keys move through the table and update the detail', sel === 'Competitor Analysis' && detail.includes('Competitor Analysis') && (await activeIndex(page)) === 9, sel)
  await page.locator('.pt__label', { hasText: 'Engineering' }).click()
  await sleep(200)
  check('Catalog: choosing a category selects its first element', (await page.$eval('.pt__cell.is-sel', (e) => e.dataset.n)) === '91')

  // Configuration
  await page.evaluate(() => (location.hash = '#configuration'))
  await sleep(1400)
  await page.getByRole('radio', { name: /AI-Native/ }).click()
  await sleep(300)
  const nativeJson = await page.locator('.cfg__json').innerText()
  const teamVisible = await page.locator('.cfg__team').count()
  await page.getByRole('radio', { name: /AI-First/ }).click()
  await sleep(300)
  await page.locator('.cfg__emp', { hasText: 'HR' }).click()
  await page.getByPlaceholder('e.g. Northwind Studio').fill('Test Co')
  await sleep(200)
  const firstJson = await page.locator('.cfg__json').innerText()
  check('Configuration: AI-Native hides the 10-employee grid', teamVisible === 0 && nativeJson.includes('"AI-Native"') && !nativeJson.includes('aiEmployees'))
  check('Configuration: AI-First composes employees into live JSON', firstJson.includes('"HR"') && firstJson.includes('"Test Co"') && firstJson.includes('"AI-First"'))
  await page.locator('.cfg__quick').getByRole('button', { name: 'Select all' }).click()
  await sleep(200)
  const pre = page.locator('.slide[data-state="active"] .cfg__json')
  const pbox = await pre.boundingBox()
  await page.mouse.move(pbox.x + pbox.width / 2, pbox.y + pbox.height / 2)
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 120)
    await sleep(40)
  }
  await sleep(1000)
  const preTop = await pre.evaluate((el) => el.scrollTop)
  check('Inner scroll: the JSON preview scrolls without changing the slide', preTop > 0 && (await activeIndex(page)) === 10, `scrollTop ${preTop}`)

  const cfgHref = await page.locator('.slide[data-state="active"]').getByRole('link', { name: /Get Early Access/ }).getAttribute('href')
  check('"Get Early Access" links point to a real destination (no fake sign-up)', /^(https?:|mailto:)/.test(cfgHref || ''), cfgHref)

  // Final slide: write the idea straight into the input
  await page.evaluate(() => (location.hash = '#start'))
  await sleep(1400)
  const title = await page.locator('.fin__title').innerText()
  const active = page.locator('.slide[data-state="active"]')
  await active.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(200)
  const emptyMsg = await page.locator('#fin-status').innerText()
  await active.getByRole('textbox', { name: 'Your idea' }).fill('An AI concierge for boutique hotels')
  await active.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(300)
  const sentMsg = await page.locator('#fin-status').innerText()
  check(
    'Final slide: "Turn your Idea into Reality" with an idea input; empty input is caught; submit hands off honestly',
    /Turn your Idea\s+into Reality/.test(title) && /write a few words/i.test(emptyMsg) && /email app/i.test(sentMsg),
    sentMsg,
  )
  await active.getByRole('button', { name: /Explore Capabilities/ }).click()
  await sleep(1300)
  check('Final CTA "Explore Capabilities" opens the catalog', (await activeIndex(page)) === 9)

  // Chrome: transparent top bar with the logo only; the progress gradient is the only bottom element
  const chrome = await page.evaluate(() => ({
    topbarChildren: [...document.querySelectorAll('.topbar > *')].length,
    logo: !!document.querySelector('.topbar .brand-mark'),
    counter: !!document.querySelector('.topbar__counter, .slide-index, .theme-switch'),
    bg: getComputedStyle(document.querySelector('.topbar')).backgroundColor,
  }))
  check('Top bar: transparent, Nr logo only (no slide counter, no theme switch)', chrome.logo && !chrome.counter && chrome.topbarChildren === 1 && /rgba\(0, 0, 0, 0\)|transparent/.test(chrome.bg), JSON.stringify(chrome))
  await page.reload({ waitUntil: 'networkidle' })
  await sleep(500)
  check('Deep link: reload keeps the current slide', (await activeIndex(page)) === 9)

  // Frame rate (headless software GL — indicative only)
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

  // Touch swipe on a phone
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
  // Let the arriving slide finish its entrance first: software GL in CI renders slowly, which
  // would otherwise stretch the next swipe past the swipe time window.
  await sleep(2800)
  const afterUp = await activeIndex(mp)
  await swipe(300, 640)
  await sleep(1200)
  const afterDown = await activeIndex(mp)
  check('Touch: swipe up → next slide, swipe down → previous slide', afterUp === 1 && afterDown === 0, `${afterUp}, ${afterDown}`)
  await m.close()

  // Reduced motion
  const r = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const rp = await r.newPage()
  trackErrors(rp, 'reduced-motion')
  await rp.goto(BASE + '#architecture', { waitUntil: 'networkidle' })
  await sleep(700)
  const visible = await rp.evaluate(() =>
    [...document.querySelectorAll('.slide[data-state="active"] .rv')].every((el) => Number(getComputedStyle(el).opacity) > 0.99),
  )
  await rp.screenshot({ path: path.join(SHOTS, 'reduced-motion-architecture.jpg'), type: 'jpeg', quality: 82 })
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
