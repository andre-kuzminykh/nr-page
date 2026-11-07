// Browser validation for the Neuronium landing.
// Visits every open block at 7 viewports, takes screenshots, checks horizontal overflow and
// JavaScript errors, then runs functional checks (menu, navigation, shared context, the
// periodic table of 100 AI employees, the departments, use cases, pricing, FAQ, final idea
// input, touch, reduced motion). Blocks and AI employees that src/data/release.ts keeps
// closed are checked to be absent instead.
//
// Usage:  npm run build && npm run preview   (in one terminal)
//         BASE_URL=http://127.0.0.1:4173/ npm run validate:browser
// Requires Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { AI_EMPLOYEES, DEPARTMENTS } from '../src/data/departments.ts'
import { ALL_SLIDES, SLIDES } from '../src/data/slides.ts'
import { ALL_EMPLOYEES_OPEN, OPEN_EMPLOYEES } from '../src/data/release.ts'

const require = createRequire(import.meta.url)

// What this release opens (src/data/release.ts); everything else must stay off the page.
const OPEN = new Set(SLIDES.map((s) => s.id))
const has = (id) => OPEN.has(id)
const openNo = (n) => OPEN_EMPLOYEES.includes(n)
const OPEN_DEPTS = DEPARTMENTS.filter((d) => has(d.id)).map((d) => ({ ...d, members: d.members.filter((m) => openNo(m.n)) }))
const NAV = [
  ['Platform', 'context'],
  ['AI Employees', 'employees'],
  [OPEN_DEPTS.length === 1 ? OPEN_DEPTS[0].name : 'Departments', OPEN_DEPTS[0]?.id],
  ['Use cases', 'custom'],
  ['Pricing', 'pricing'],
  ['FAQ', 'faq'],
  ['Contacts', 'start'],
].filter(([, id]) => id && has(id))
let chromium
try {
  ;({ chromium } = require('playwright'))
} catch {
  console.error('Playwright is required: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/'
// where the buttons lead (src/config/links.ts; the build is checked with its defaults)
const PLATFORM = process.env.VITE_PLATFORM_URL || 'https://platform.neuronium.ai/'
const KM = process.env.VITE_KM_URL || 'https://management.neuronium.ai/km'
const SUPPORT = 'support@neuronium.ai'
const OUT = path.resolve('validation')
const SHOTS = path.join(OUT, 'screenshots')
const VIEWPORTS = [
  [1920, 1080],
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
// screenshots from an earlier run (with other blocks open) must not mix with this one
fs.rmSync(SHOTS, { recursive: true, force: true })
fs.mkdirSync(SHOTS, { recursive: true })
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
        // a solo show is measured at its fullest: once the answer and its sources are in
        await page
          .waitForFunction(
            () => {
              const s = document.querySelector('.slide[data-state="active"]')
              const src = [...(s?.querySelectorAll('.kq-src') ?? [])]
              return !s?.querySelector('.kq') || (src.length > 0 && src.every((x) => getComputedStyle(x).visibility !== 'hidden' && Number(getComputedStyle(x).opacity) > 0.95))
            },
            null,
            { timeout: 9000 },
          )
          .catch(() => {})
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
      check(`Layout ${label}: ${SLIDES.length} blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync`, bad.length === 0, bad.length ? JSON.stringify(bad.map((b) => ({ slide: b.slide, off: b.offenders, x: b.docOverflowX })) ) : scrolls.length ? `inner scroll used on slide(s) ${scrolls.join(', ')}` : 'all slides fit without inner scroll')
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

  // A gradient painted inside a border repeats under it: a sliver of its other end shows at the edges.
  const seams = await page.evaluate(() => {
    const bad = []
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (!cs.backgroundImage.includes('gradient')) continue
      if (!['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(cs[`border${k}Width`]) > 0)) continue
      // the image layers, split at the commas between them (not those inside a gradient)
      const layers = []
      let depth = 0
      let cur = ''
      for (const ch of cs.backgroundImage) {
        if (ch === '(') depth++
        if (ch === ')') depth--
        if (ch === ',' && depth === 0) {
          layers.push(cur.trim())
          cur = ''
        } else cur += ch
      }
      layers.push(cur.trim())
      const at = (list, k) => {
        const xs = list.split(',').map((x) => x.trim())
        return xs[k % xs.length]
      }
      layers.forEach((img, k) => {
        if (!img.includes('gradient')) return
        if (at(cs.backgroundOrigin, k) === 'padding-box' && at(cs.backgroundClip, k) === 'border-box' && at(cs.backgroundRepeat, k) !== 'no-repeat')
          bad.push(`${el.className || el.tagName} (layer ${k + 1})`)
      })
    }
    return bad
  })
  check('No gradient bleeds at the edges: every gradient under a border spans that border', seams.length === 0, seams.slice(0, 4).join(' · ') || 'none')
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
  // The word fills its column exactly — on wide screens the column stops at 1400px, the window does not.
  const heroFit = []
  for (const [w, h] of [[1280, 800], [1920, 1080], [2560, 1440], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h })
    await sleep(350)
    heroFit.push(
      await page.evaluate((w) => {
        const main = document.querySelector('.hero__main').getBoundingClientRect()
        const slots = [...document.querySelectorAll('.hero__slot')].map((s) => s.getBoundingClientRect())
        const ok = slots[0].left >= main.left - 1 && slots.at(-1).right <= main.right + 1 && slots.at(-1).right >= main.right - 24
        return `${w}:${ok ? 'fits' : `${Math.round(slots[0].left)}–${Math.round(slots.at(-1).right)} vs ${Math.round(main.left)}–${Math.round(main.right)}`}`
      }, w),
    )
  }
  check('Hero: NEURONIUM fills its column exactly at 1280, 1920, 2560 and 1440 px wide', heroFit.every((x) => x.endsWith('fits')), heroFit.join(' · '))

  // Top menu
  const nav = await page.evaluate(() => ({
    logo: document.querySelector('.nav__brand')?.textContent.trim(),
    logoTile: !!document.querySelector('.nav__brand svg, .nav__brand rect') || getComputedStyle(document.querySelector('.nav__logo')).backgroundColor !== 'rgba(0, 0, 0, 0)',
    items: [...document.querySelectorAll('.nav__menu .nav__item')].map((b) => b.textContent.trim()),
    cta: document.querySelector('.nav__cta')?.textContent.trim(),
    ctaHref: document.querySelector('.nav__cta')?.getAttribute('href'),
    bg: getComputedStyle(document.querySelector('.nav')).backgroundColor,
    counter: !!document.querySelector('.topbar__counter, .slide-index, .theme-switch'),
  }))
  check(
    `Top menu: transparent, logo is the two letters Nr (no tile), only the open sections (${NAV.map(([l]) => l).join(' · ')}), Get Early Access to the platform`,
    nav.logo === 'Nr' && !nav.logoTile && nav.items.join('|') === NAV.map(([l]) => l).join('|') && /Get Early Access/.test(nav.cta) && nav.ctaHref === PLATFORM && /rgba\(0, 0, 0, 0\)|transparent/.test(nav.bg) && !nav.counter,
    JSON.stringify(nav),
  )
  if (OPEN_DEPTS.length > 1) {
    const [farLabel, farId] = NAV.filter(([, id]) => !OPEN_DEPTS.some((d) => d.id === id)).at(-1)
    const pick = OPEN_DEPTS.at(-1)
    await page.locator('.nav__item', { hasText: farLabel }).click()
    await sleep(1300)
    const onFar = (await activeIndex(page)) === at(farId)
    await page.locator('.nav__item', { hasText: 'Departments' }).click()
    await sleep(300)
    const ddItems = await page.$$eval('.nav__panel .nav__dept-name', (els) => els.map((e) => e.textContent.trim()))
    await page.mouse.wheel(0, 200)
    await sleep(900)
    const stayedWhileOpen = (await activeIndex(page)) === at(farId)
    await page.locator('.nav__dept', { hasText: pick.name }).click()
    await sleep(1400)
    const navLabel = await page.$eval('.nav__dd .nav__item', (b) => b.textContent.trim())
    check(
      `Menu: jumps to sections; Departments opens the ${OPEN_DEPTS.length} open departments; scrolling is ignored while it is open`,
      onFar && ddItems.join('|') === OPEN_DEPTS.map((d) => d.name).join('|') && stayedWhileOpen && (await activeIndex(page)) === at(pick.id) && navLabel === pick.name,
      `dropdown: ${ddItems.length} · label: ${navLabel}`,
    )
  } else {
    const only = OPEN_DEPTS[0]
    await page.locator('.nav__item', { hasText: 'Platform' }).click()
    await sleep(1300)
    const onPlatform = (await activeIndex(page)) === at('context')
    await page.locator('.nav__item', { hasText: only.name }).click()
    await sleep(1300)
    const menu = await page.evaluate(() => ({
      active: document.querySelector('.nav__item.is-active')?.textContent.trim(),
      dropdown: document.querySelectorAll('.nav__dd, .nav__panel, .nav__chev').length,
    }))
    check(
      `Menu: jumps to sections; with one department open, “${only.name}” links straight to it (no dropdown)`,
      onPlatform && (await activeIndex(page)) === at(only.id) && menu.active === only.name && menu.dropdown === 0,
      JSON.stringify(menu),
    )
  }

  // Staged release: closed blocks are not on the page, and links to them go nowhere
  const closed = ALL_SLIDES.filter((x) => !has(x.id)).map((x) => x.id)
  const stage = await page.evaluate(() => ({
    slides: document.querySelectorAll('.slide').length,
    table: document.querySelectorAll('.pt, .pt__cell').length,
    text: document.body.innerText,
  }))
  const stray = closed.length ? closed[0] : null
  let strayStays = true
  if (stray) {
    const before = await activeIndex(page)
    await page.evaluate((h) => (location.hash = h), `#${stray}`)
    await sleep(900)
    strayStays = (await activeIndex(page)) === before
  }
  check(
    `Staged release: only the open blocks are on the page (${SLIDES.map((x) => x.id).join(' · ')}); closed ones are left out and links to them do nothing`,
    stage.slides === SLIDES.length && (has('employees') || stage.table === 0) && (has('faq') || !/Who stays in control/.test(stage.text)) && strayStays,
    `${stage.slides} blocks · ${closed.length} closed${stray ? ` · #${stray} ignored` : ''}`,
  )

  // Wheel and trackpad
  await go('hero')
  await page.mouse.move(700, 450)
  await page.mouse.wheel(0, 120)
  await sleep(1100)
  check('Mouse wheel: one notch moves exactly one block', (await activeIndex(page)) === 1)
  // A long trackpad gesture with inertia, sent through the browser's input pipeline with
  // evenly spaced timestamps (as an OS inertia stream would be).
  const cdpWheel = await ctx.newCDPSession(page)
  const t0 = Date.now()
  for (let i = 0; i < 90; i++) {
    const wait = t0 + i * 16 - Date.now()
    if (wait > 0) await sleep(wait)
    await cdpWheel.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 450, deltaX: 0, deltaY: Math.max(1, 60 * Math.exp(-i / 18)), timestamp: (t0 + i * 16) / 1000 })
  }
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

  // The AI Superagent in the business context: commands below the brain, each with its own way
  await go('context')
  const cx = await page.evaluate(async () => {
    const s = document.querySelector('.slide[data-state="active"]')
    const nodes = [...s.querySelectorAll('.cb-n')]
    // watch the commands go by: which tools light up for each one
    const ways = {}
    let maxWay = 0
    // while no command is running, the brain shows no tools
    let idleIcons = 0
    const t0 = performance.now()
    while (performance.now() - t0 < 48000) {
      if (!s.querySelector('.prompt.is-sent'))
        idleIcons = Math.max(idleIcons, nodes.filter((g) => Number(g.children[3]?.getAttribute('opacity') ?? 0) > 0.05).length)
      const cmd = s.querySelector('.prompt__q .sr-only')?.textContent.trim()
      if (cmd) {
        ways[cmd] ??= new Set()
        for (const n of s.querySelectorAll('.cb-n.is-on:not(.cb-n--core) .cb-lab')) ways[cmd].add(n.textContent)
      }
      maxWay = Math.max(maxWay, s.querySelectorAll('.cb line[display="inline"]').length)
      if (Object.keys(ways).length === 3 && [...Object.values(ways)].every((w) => w.size === 4)) break
      await new Promise((r) => setTimeout(r, 200))
    }
    return {
      nodes: nodes.length,
      labels: nodes.map((n) => n.querySelector('.cb-lab')?.textContent).join('|'),
      ways: Object.fromEntries(Object.entries(ways).map(([k, v]) => [k, [...v]])),
      maxWay,
      idleIcons,
      lead: s.querySelectorAll('.prompt__lead, .prompt > svg').length,
      text: s.querySelector('.slide__frame').innerText.replace(/\s+/g, ' ').trim(),
    }
  })
  const ways = Object.values(cx.ways)
  const reached = new Set(ways.flat())
  check(
    'AI Superagent: a brain of 12 tools that shows none at rest; three commands are typed into the bar below it, each sends the agent its own way and its tools appear on it, and together they reach every tool',
    cx.nodes === 13 && /Gmail.*Calendar.*Meet.*Slack.*Telegram.*WhatsApp.*Drive.*Docs.*Sheets.*Apollo.*Code.*APIs/.test(cx.labels) && ways.length === 3 && ways.every((w) => w.length === 4) && reached.size === 12 && cx.maxWay > 4 && cx.idleIcons === 0 && cx.lead === 0,
    `${Object.entries(cx.ways).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' · ')} · icons at rest: ${cx.idleIcons}`,
  )
  check('AI Superagent: the title “AI Superagent works in your business context”, no extra copy', /^AI Superagent works in your business context/.test(cx.text) && !/MCP|sample data|Knowledge Graph\./.test(cx.text), cx.text.slice(0, 60))

  // Periodic table of 100 AI employees
  if (has('employees')) {
    await go('employees')
    const walk0 = await page.$eval('.pt__line.is-row .pt__label-name', (e) => e.textContent).catch(() => null)
    await sleep(3800)
    const walk1 = await page.$eval('.pt__line.is-row .pt__label-name', (e) => e.textContent).catch(() => null)
    const walkCard = await page.$eval('.emp__card--dept .emp__dept-name', (e) => e.textContent).catch(() => null)
    check('Periodic table: until someone interacts, it walks through the departments and explains each one', walk0 === 'Management' && walk1 === 'HR' && walkCard === 'HR', `${walk0} → ${walk1}`)
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
    const quiet = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      return !/Product scope|availability varies|Pick an element/i.test(s.innerText) && !s.querySelector('.pt__sweep')
    })
    check('Periodic table: no scope notes, no placeholder text, no light sweep over the table', quiet)
    await page.locator('.pt__label', { hasText: 'Analytics' }).hover()
    await sleep(350)
    const hovD = await page.$eval('.emp__card--dept .emp__dept-name', (e) => e.textContent).catch(() => null)
    await page.locator('.pt__cell[data-n="44"]').hover()
    await sleep(350)
    const hovE = await page.evaluate(() => ({ no: document.querySelector('.emp__card .emp__card-no')?.textContent.trim(), name: document.querySelector('.emp__card .emp__card-name')?.textContent.trim() }))
    await page.mouse.move(5, 450)
    await sleep(400)
    check('Periodic table: hovering a department or an element explains it on the left — “44 · Sq” above “Personalized Sequences”', hovD === 'Analytics' && hovE.no === '44 · Sq' && hovE.name === 'Personalized Sequences', `${hovD} · ${hovE.no} / ${hovE.name}`)
    await page.locator('.pt__label', { hasText: 'Marketing' }).click()
    await sleep(500)
    const dsel = await page.evaluate(() => ({
      row: document.querySelector('.pt.has-dept .pt__line.is-row .pt__label-name')?.textContent,
      card: document.querySelector('.emp__card--dept .emp__dept-name')?.textContent,
      words: (document.querySelector('.emp__card--dept .emp__card-desc')?.textContent ?? '').length > 40,
      tiles: document.querySelectorAll('.emp__card--dept .sym, .emp__card--dept .element').length,
      pressed: document.querySelector('.pt__label[aria-pressed="true"] .pt__label-name')?.textContent,
    }))
    await page.locator('.emp__card--dept').getByRole('button', { name: /Open Marketing/ }).click()
    await page.waitForFunction((i) => Number(document.querySelector('.slide[data-state="active"]')?.dataset.slide) === i, at('marketing'), { timeout: 4000 }).catch(() => {})
    check(
      'Periodic table: a department is picked from its row — the row lights up, a card explains it in words (no tiles) and opens the block',
      dsel.row === 'Marketing' && dsel.card === 'Marketing' && dsel.words && dsel.tiles === 0 && dsel.pressed === 'Marketing' && (await activeIndex(page)) === at('marketing'),
      JSON.stringify(dsel),
    )
    await go('employees')

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
  }

  // The open departments: every open AI employee lights up its own part of the interface
  const missing = []
  for (const dpt of OPEN_DEPTS) {
    await go(dpt.id)
    const slide = page.locator('.slide[data-state="active"]')
    const els = await slide.locator('.dept__el').evaluateAll((b) => b.map((x) => x.dataset.name))
    if (els.join('|') !== dpt.members.map((m) => m.name).join('|')) missing.push(`${dpt.name}: wrong elements`)
    if (dpt.members.length === 1) {
      // one open AI employee leads the block: its name, what it does, its element and its own show
      const [m] = dpt.members
      const solo = await slide.evaluate((el) => ({
        title: [...el.querySelectorAll('.dept__title .mask')].map((x) => x.textContent.trim()).join(' '),
        desc: el.querySelector('.dept__desc')?.textContent.trim(),
        label: el.querySelector('.dept__label')?.textContent.trim(),
        count: el.querySelectorAll('.dept__count').length,
        caption: el.querySelectorAll('.dept__caption').length,
        show: el.querySelectorAll('.dept__solo > *').length,
        load: el.querySelectorAll('.dept__el-load').length,
      }))
      if (solo.title !== (m.lead?.title ?? m.name) || solo.desc !== (m.lead?.line ?? m.description) || solo.label !== dpt.name || solo.count || solo.caption || !solo.show || solo.load !== 1) missing.push(`${m.n} ${m.name} alone: ${JSON.stringify(solo)}`)
    } else {
      for (const m of dpt.members) {
        await slide.locator(`#tab-${m.n}`).click()
        await sleep(80)
        const state = await slide.evaluate((el) => ({
          hot: el.querySelectorAll('.dept__slot.is-focus .is-hot').length,
          focus: el.querySelectorAll('.dept__stage .pn.is-focus').length,
          windows: el.querySelectorAll('.dept__slot.is-focus').length,
          cap: el.querySelector('.dept__cap-desc')?.textContent,
        }))
        if (!state.hot || state.focus !== 1 || state.windows !== 1 || state.cap !== m.description) missing.push(`${m.n} ${m.name}`)
      }
    }
  }
  const openCount = OPEN_DEPTS.reduce((k, d) => k + d.members.length, 0)
  check(
    `Departments: ${OPEN_DEPTS.length} open block(s) with only their open AI employees (${openCount}); one interface at a time, each AI employee lights up its own part — and one AI employee alone leads its block with its name, what it does and its element`,
    OPEN_DEPTS.length > 0 && missing.length === 0,
    missing.length ? missing.slice(0, 6).join(', ') : OPEN_DEPTS.map((d) => `${d.name}: ${d.members.map((m) => m.symbol).join(' ')}`).join(' · '),
  )

  // Management: the same six tasks become a list, a Gantt chart, a calendar and a board
  if ([4, 5, 6, 8].every(openNo)) {
    await go('management')
    const slideM = page.locator('.slide[data-state="active"]')
    const tasksIn = async (n) => {
      await slideM.locator(`#tab-${n}`).click()
      await sleep(1300)
      return slideM.evaluate((el) => ({
        view: el.querySelector('.mgx')?.dataset.view,
        on: el.querySelectorAll('.mgx-t.is-on').length,
        boxes: [...el.querySelectorAll('.mgx-t')].map((t) => {
          const r = t.getBoundingClientRect()
          return `${Math.round(r.width)}x${Math.round(r.height)}`
        }).join(','),
      }))
    }
    const story = [await tasksIn(4), await tasksIn(6), await tasksIn(8), await tasksIn(5)]
    check(
      'Management: one interface — the same six tasks turn from a list into a Gantt chart, a calendar and a board',
      story.map((x) => x.view).join('>') === 'tasks>gantt>calendar>board' && story.every((x) => x.on === 6) && new Set(story.map((x) => x.boxes)).size === 4,
      story.map((x) => `${x.view}:${x.on}`).join(' '),
    )
    const boardSteps = await slideM.evaluate(async () => {
      const col = () => [...document.querySelectorAll('.slide[data-state="active"] .mgx-t')].map((t) => Math.round(t.getBoundingClientRect().left)).join(',')
      const a = col()
      await new Promise((r) => setTimeout(r, 3600))
      return [a, col()]
    })
    check('Management board: tasks move on from To do to In progress to Done', boardSteps[0] !== boardSteps[1])
  }

  // Management · Knowledge: it answers one question after another
  if (has('management') && openNo(1)) {
    await go('management')
    const alone = OPEN_DEPTS.find((d) => d.id === 'management').members.length === 1
    if (!alone) {
      // picking Knowledge keeps it on screen (autoplay stops when an element is picked)
      await page.locator('.slide[data-state="active"] #tab-1').click()
      await sleep(300)
    }
    const km = await page.evaluate(async (alone) => {
      const s = document.querySelector('.slide[data-state="active"]')
      const ask = () => s.querySelector(alone ? '.kq .prompt__q .sr-only' : '.mgx-search .sr-only')?.textContent.trim()
      const shown = (el) => getComputedStyle(el).visibility !== 'hidden' && Number(getComputedStyle(el).opacity) > 0.9
      // wait for the next question, then let its answer and sources arrive
      const seen = []
      let next = 0
      let full = null
      const t0 = performance.now()
      while (performance.now() - t0 < 18000 && !full) {
        const q = ask()
        if (q && seen.at(-1) !== q) {
          seen.push(q)
          if (seen.length === 2) next = performance.now()
        }
        if (next && performance.now() - next > 4600) {
          full = alone
            ? {
                sources: [...s.querySelectorAll('.kq-src')].filter(shown).length,
                // each source is just its icon and its name
                plain: [...s.querySelectorAll('.kq-src')].every((x) => x.children.length === 2 && x.children[0].tagName === 'svg' && !/^\d/.test(x.textContent.trim())),
                cites: s.querySelectorAll('.kq-cite, .kq-num').length,
                answer: s.querySelector('.kq-text')?.textContent.trim().length ?? 0,
                frame: s.querySelectorAll('.dept__stage .pn, .dept__stage .pn__head').length,
                lead: s.querySelectorAll('.kq .prompt__lead, .kq .prompt > svg').length,
              }
            : {
                sources: s.querySelectorAll('.mgx-answer .mgx-src span').length,
                found: [...s.querySelectorAll('.mgx-doc')].filter(shown).length,
              }
        }
        await new Promise((r) => setTimeout(r, 150))
      }
      return { view: s.querySelector('.mgx')?.dataset.view, seen, full }
    }, alone)
    check(
      alone
        ? 'Management · Knowledge Management (1 · Km) on its own: no window, just the search bar at the bottom — a question is typed and answered above it, with the three things it was found in (an icon and a name each), then the next question'
        : 'Management · Knowledge Management (1 · Km): asks and answers one question after another, each answer with its sources and the documents it was found in',
      km.seen.length >= 2 && (alone ? km.full?.sources === 3 && km.full?.plain && km.full?.cites === 0 && km.full?.answer > 40 && km.full?.frame === 0 && km.full?.lead === 0 : km.view === 'knowledge' && km.full?.sources === 2 && km.full?.found === 2),
      `${km.seen.join(' → ')} · ${JSON.stringify(km.full)}`,
    )
  }

  // Custom use cases: the AI employee as a node graph
  if (has('custom')) {
    await go('custom')
    await page.getByRole('tab', { name: 'Supplier Check' }).click()
    // the graph draws itself, then the data starts to stream (about 2.5 s, longer under software rendering)
    await page.waitForFunction(() => [...document.querySelectorAll('.slide[data-state="active"] .fl-e__flow')].filter((e) => Number(getComputedStyle(e).opacity) > 0.5).length >= 5, null, { timeout: 8000 }).catch(() => {})
    const cu = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      const nodes = [...s.querySelectorAll('.fl-n')]
      return {
        el: s.querySelector('.cu__el-n')?.textContent,
        nodes: nodes.length,
        kinds: [...new Set(nodes.map((n) => [...n.classList].find((c) => c.startsWith('fl-n--'))))].sort().join(','),
        flows: s.querySelectorAll('.fl-e__flow').length,
        flowing: [...s.querySelectorAll('.fl-e__flow')].filter((e) => Number(getComputedStyle(e).opacity) > 0.5).length,
      }
    })
    check(
      'Use cases: a custom AI employee as a node graph — grey system, orange human, violet LLM — with data streaming along the connections (element 103)',
      cu.el === '103' && cu.nodes === 7 && cu.kinds === 'fl-n--human,fl-n--llm,fl-n--system' && cu.flows === 7 && cu.flowing >= 5,
      JSON.stringify(cu),
    )
  }

  // Pricing — no invented prices
  if (has('pricing')) {
    await go('pricing')
    const pr = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      return {
        plans: [...s.querySelectorAll('.pr-plan')].map((x) => ({
          name: x.querySelector('.pr-plan__name')?.textContent.trim(),
          price: x.querySelector('.pr-plan__price')?.textContent.replace(/\s+/g, ' ').trim(),
          line: x.querySelector('.pr-plan__line')?.textContent.trim(),
          cta: x.querySelector('.pr-plan__cta')?.textContent.trim(),
          href: x.querySelector('.pr-plan__cta')?.getAttribute('href') ?? '',
          includes: [...x.querySelectorAll('.pr-plan__list li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()).join('|'),
          extra: x.querySelectorAll('.pr-grid, .pr-plan__tag, .pr-plan__note').length,
        })),
        title: s.querySelector('.pr__title')?.textContent.trim(),
        copy: s.querySelectorAll('.pr__copy, .pr__note').length,
      }
    })
    const want = [
      ['Standard', '$ 59 / month', 'Bring your own Provider Key', 'Start Free Trial', 'AI Superagent|AI Management|Your AI Costs'],
      ['Solo', '$ 190 / month', 'For a solo builder', 'Start Free Trial', 'AI Superagent|AI Management|1 000 AI Work Hours'],
      ['Business', '$ 890 / month', 'Up to 10 people', 'Start Free Trial', 'AI Superagent|AI Management|10 000 AI Work Hours'],
      ['Enterprise', 'Contact us', 'More than 10 people', 'Contact sales', 'AI Superagent|AI Management|Custom AI Work Hours'],
    ]
    const asWanted = pr.plans.length === 4 && want.every(([n, p, l, c, inc], k) => {
      const x = pr.plans[k]
      // the spaces around the price are margins, not text
      return x.name === n && x.price.replace(/\s+/g, '') === p.replace(/\s+/g, '') && x.line === l && x.cta === c && (c === 'Start Free Trial' ? x.href === PLATFORM : x.href.startsWith(`mailto:${SUPPORT}`)) && x.includes === inc && x.extra === 0
    })
    check(
      'Pricing: Standard $59, Solo $190, Business $890 with Start Free Trial (to the platform), Enterprise “Contact us” with Contact sales (to support) — a name, a price, one line, what it includes and a button, no other copy',
      asWanted && pr.title === 'Pricing' && pr.copy === 0,
      pr.plans.map((x) => `${x.name} ${x.price} · ${x.cta} → ${x.href.slice(0, 40)}`).join(' | '),
    )
  }

  // FAQ
  if (has('faq')) {
    await go('faq')
    await page.getByRole('button', { name: /Who stays in control/ }).click()
    await sleep(700)
    const faqState = await page.evaluate(() => ({
      open: [...document.querySelectorAll('.slide[data-state="active"] .faq__q[aria-expanded="true"]')].map((b) => b.textContent),
      text: document.querySelector('.slide[data-state="active"] .faq__item.is-open .faq__a')?.textContent ?? '',
    }))
    check('FAQ: answers open in place, one at a time — opening one closes the others', faqState.open.length === 1 && /Who stays in control/.test(faqState.open[0]) && /AI Governance/.test(faqState.text), faqState.text.slice(0, 60))
    if (!ALL_EMPLOYEES_OPEN) {
      await page.getByRole('button', { name: /Is it available today/ }).click()
      await sleep(700)
      const today = await page.evaluate(() => ({
        a: document.querySelector('.slide[data-state="active"] .faq__item.is-open .faq__a')?.textContent ?? '',
        qs: [...document.querySelectorAll('.slide[data-state="active"] .faq__q-text')].map((q) => q.textContent.trim()),
      }))
      const ready = OPEN_DEPTS.flatMap((dpt) => dpt.members)
      check(
        'FAQ: answers for today — it names what is ready now — and leaves out questions about closed blocks',
        (ready.length > 4 ? today.a.includes(`${ready.length} AI employees`) : ready.every((x) => today.a.includes(x.name))) && (has('custom') || !today.qs.some((q) => /create my own/i.test(q))),
        `${today.qs.length} questions · ${today.a.slice(0, 90)}`,
      )
    }
  }

  // Final: the task goes to the platform with it (the platform is stood in for, so nothing leaves this machine)
  await go('start')
  const fin = await page.evaluate(() => ({
    title: [...document.querySelectorAll('.fin__title .mask')].map((m) => m.textContent.trim()).join(' '),
    centerMark: !!document.querySelector('.fin .brand-mark'),
    sub: document.querySelector('.fin__sub')?.textContent.trim(),
    status: document.querySelectorAll('#fin-status, .fin__status').length,
    placeholder: document.querySelector('#fin-idea')?.getAttribute('placeholder'),
  }))
  const hand = await ctx.newPage()
  const landed = []
  await hand.route(`${new URL(PLATFORM).origin}/**`, (r) => {
    landed.push(r.request().url())
    return r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Platform</title>' })
  })
  await hand.goto(`${BASE}#start`)
  await hand.waitForTimeout(1600)
  const handActive = hand.locator('.slide[data-state="active"]')
  await Promise.all([hand.waitForURL((u) => u.href.startsWith(PLATFORM), { timeout: 5000 }), handActive.getByRole('button', { name: /Get Early Access/ }).click()])
  await hand.goto(`${BASE}#start`)
  await hand.waitForTimeout(1600)
  const task = 'An AI concierge for boutique hotels'
  await hand.locator('.slide[data-state="active"]').getByRole('textbox', { name: 'Your business task' }).fill(task)
  await Promise.all([hand.waitForURL((u) => u.href.startsWith(PLATFORM) && u.searchParams.has('task'), { timeout: 5000 }), hand.keyboard.press('Enter')])
  await hand.close()
  const withTask = landed.find((u) => new URL(u).searchParams.get('task') === task)
  check(
    'Final: “Run Your AI Business”, “with Neuronium” smaller below, “Describe your business task”; Get Early Access opens the platform, and a written task is carried over to it (?task=)',
    fin.title === 'Run Your AI Business' && !fin.centerMark && fin.sub === 'with Neuronium' && fin.status === 0 && fin.placeholder === 'Describe your business task' && landed[0] === PLATFORM && !!withTask,
    landed.join(' · '),
  )
  // Contacts: the menu's last item leads to the final block; its foot holds who made it, the socials, support and the legal pages
  await go('hero')
  await page.locator('.nav__item', { hasText: 'Contacts' }).click()
  await sleep(1300)
  const ct = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    const foot = s.querySelector('.fin__foot')
    const logo = foot?.querySelector('.fin__by img')
    const a = [...(foot?.querySelectorAll('a') ?? [])]
    return {
      last: Number(s.dataset.slide) === document.querySelectorAll('.slide').length - 1,
      title: s.querySelector('.fin__title')?.textContent.trim(),
      by: foot?.querySelector('.fin__by')?.textContent.trim(),
      byHref: foot?.querySelector('.fin__by')?.getAttribute('href'),
      logo: logo ? { loaded: logo.complete && logo.naturalWidth > 0, h: Math.round(logo.getBoundingClientRect().height) } : null,
      social: [...(foot?.querySelectorAll('.fin__social a') ?? [])].map((x) => [x.getAttribute('aria-label'), x.getAttribute('href'), !!x.querySelector('svg path')]),
      oss: foot?.querySelector('.fin__icon--oss')?.textContent.trim(),
      legal: [...(foot?.querySelectorAll('.fin__legal a') ?? [])].map((x) => [x.textContent.trim(), x.getAttribute('href')]),
      newTab: a.filter((x) => /^https?:/.test(x.getAttribute('href'))).every((x) => x.target === '_blank' && /noreferrer/.test(x.rel)),
      active: document.querySelector('.nav__item.is-active')?.textContent.trim(),
      blocks: document.querySelectorAll('.slide').length,
    }
  })
  const socialWant = [
    ['LinkedIn', /linkedin\.com\//],
    ['X', /^https:\/\/x\.com\//],
    ['Instagram', /instagram\.com\//],
    ['TikTok', /tiktok\.com\/@/],
    ['YouTube', /youtube\.com\/@/],
    ['GitHub — open source', /^https:\/\/github\.com\/[^/]+$/],
  ]
  const legalWant = [
    [SUPPORT, `mailto:${SUPPORT}`],
    ['Terms of Use', /^https:\/\/.+\/terms\/?$/],
    ['Privacy Policy', /^https:\/\/.+\/privacy\/?$/],
  ]
  check(
    'Contacts: last in the menu, after FAQ — it opens the final block, whose foot has “Created by” with the orange AIT logo (andre.technology), LinkedIn · X · Instagram · TikTok · YouTube · GitHub (open source), support@neuronium.ai, Terms of Use and Privacy Policy',
    NAV.at(-1)[0] === 'Contacts' && ct.last && ct.title === 'Run Your AI Business' && ct.active === 'Contacts' && ct.blocks === SLIDES.length &&
      /Created by/i.test(ct.by) && /andre\.technology/.test(ct.byHref) && ct.logo?.loaded && ct.logo.h >= 14 &&
      ct.social.length === socialWant.length && socialWant.every(([l, re], k) => ct.social[k][0] === l && re.test(ct.social[k][1]) && ct.social[k][2]) && /open source/i.test(ct.oss) &&
      ct.legal.length === legalWant.length && legalWant.every(([l, h], k) => ct.legal[k][0] === l && (typeof h === 'string' ? ct.legal[k][1] === h : h.test(ct.legal[k][1]))) &&
      ct.newTab,
    JSON.stringify({ by: ct.by, logo: ct.logo, social: ct.social.map((x) => x[1]), legal: ct.legal.map((x) => x[1]) }),
  )
  // The way out to the products: Platform (block 2) and Knowledge Management (its block)
  const outs = {}
  await go('context')
  outs.platform = await page.evaluate(() => {
    const a = document.querySelector('.slide[data-state="active"] .ctx__cta')
    return a && { text: a.textContent.trim(), href: a.getAttribute('href'), seen: a.getBoundingClientRect().height > 0 }
  })
  if (OPEN_DEPTS.some((dpt) => dpt.id === 'management' && dpt.members.length === 1 && dpt.members[0].n === 1)) {
    await go('management')
    outs.km = await page.evaluate(() => {
      const a = document.querySelector('.slide[data-state="active"] .dept__cta')
      return a && { text: a.textContent.trim(), href: a.getAttribute('href'), seen: a.getBoundingClientRect().height > 0 }
    })
  }
  check(
    `Buttons out: “Open Platform” on the AI Superagent block → ${PLATFORM}${outs.km !== undefined ? `; “Open Knowledge Management” beside the Km element → ${KM}` : ''}`,
    outs.platform?.text === 'Open Platform' && outs.platform.href === PLATFORM && outs.platform.seen && (outs.km === undefined || (outs.km?.text === 'Open Knowledge Management' && outs.km.href === KM && outs.km.seen)),
    JSON.stringify(outs),
  )
  await go('start')
  const active = page.locator('.slide[data-state="active"]')
  const deep = has('employees') ? 'employees' : OPEN_DEPTS[0]?.id ?? 'context'
  if (has('employees')) {
    await active.getByRole('button', { name: /Explore AI Employees/ }).click()
    await sleep(1300)
    check('Final: “Explore AI Employees” opens the periodic table', (await activeIndex(page)) === at('employees'))
  } else {
    check('Final: no “Explore AI Employees” link while the periodic table is closed', (await active.getByRole('button', { name: /Explore AI Employees/ }).count()) === 0)
    await go(deep)
  }
  await page.reload({ waitUntil: 'networkidle' })
  await sleep(600)
  check(`Deep link: reload keeps the current block (#${deep})`, (await activeIndex(page)) === at(deep))

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
  const [sheetLabel, sheetId] = NAV.at(-1)
  await mp.locator('.nav__sheet-item', { hasText: sheetLabel }).click()
  await sleep(1400)
  check(`Phone menu: opens full screen, blocks swipes while open, jumps to a section (${sheetLabel})`, stayed && (await activeIndex(mp)) === at(sheetId))
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
