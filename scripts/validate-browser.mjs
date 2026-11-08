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
import { KM_NAV, KM_SLIDES } from '../src/km/slides.ts'
import { CASES } from '../src/data/cases.ts'

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
  ['Cases', 'cases'],
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
/** Knowledge Management's cases (its page shows only these) and how many cases there are in all. */
const KM_CASES = CASES.filter((c) => c.topics.includes('Knowledge Management')).map((c) => c.title)
const CASE_COUNT = CASES.length
const KM = process.env.VITE_KM_URL || 'https://management.neuronium.ai/km'
const SUPPORT = 'support@neuronium.ai'
const KM_ABOUT = '/knowledge-management/'
const GITHUB = 'https://github.com/andre-kuzminykh'
const OUT = path.resolve('validation')
const SHOTS = path.join(OUT, 'screenshots')
const VIEWPORTS = [
  [1920, 1080],
  [1440, 900],
  [1440, 760],
  [1366, 657],
  [1280, 800],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [375, 667],
  [360, 640],
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

async function layoutPass(browser, { url = BASE, slides = SLIDES, tag = '' } = {}) {
  fs.mkdirSync(SHOTS, { recursive: true })
  for (const [w, h] of VIEWPORTS) {
    for (const theme of THEMES) {
      const label = `${tag ? `${tag}-` : ''}${w}x${h}-${theme}`
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 800 })
      const page = await ctx.newPage()
      trackErrors(page, label)
      await page.goto(url, { waitUntil: 'networkidle' })
      await sleep(SETTLE)
      const dir = path.join(SHOTS, label)
      fs.mkdirSync(dir, { recursive: true })
      for (let i = 0; i < slides.length; i++) {
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
        // the FAQ is measured at its tallest: with its longest answer open
        if (slides[i].id === 'faq') {
          const longest = await page.evaluate(() => {
            const items = [...document.querySelectorAll('.slide[data-state="active"] .faq__item')]
            const len = items.map((it) => it.querySelector('.faq__a')?.textContent.length ?? 0)
            return len.indexOf(Math.max(...len))
          })
          await page.locator('.slide[data-state="active"] .faq__q').nth(longest).click()
          await sleep(900)
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
          const truncated = [...(slide?.querySelectorAll('.pn__title, .pr-tiers__opt, .pr-tiers__l') ?? [])]
            .filter((t) => t.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && t.scrollWidth > t.clientWidth + 1)
            .map((t) => `title: ${t.textContent.trim()}`)
          // the “Write to us” button in the corner never covers anything that can be clicked
          const L = document.querySelector('.cw__launch')?.getBoundingClientRect()
          const under = L
            ? [...(slide?.querySelectorAll('a, button, input, textarea, [role="tab"], [tabindex="0"]') ?? [])]
                .filter((e) => {
                  const r = e.getBoundingClientRect()
                  return r.width && r.height && r.right > L.left && r.left < L.right && r.bottom > L.top && r.top < L.bottom
                })
                .map((e) => `under the widget: ${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`)
            : ['no widget']
          offenders.push(...clipped, ...truncated, ...under)
          return {
            docOverflowX: document.documentElement.scrollWidth - vw,
            frameOverflowY: frame ? frame.scrollHeight - frame.clientHeight : 0,
            // a block never scrolls inside; a block too tall for the window is drawn smaller to fit
            scrolls: frame ? getComputedStyle(frame).overflowY !== 'hidden' : true,
            fit: frame ? Number(getComputedStyle(frame).zoom) || 1 : 1,
            cut: frame
              ? (() => {
                  const z = Number(getComputedStyle(frame).zoom) || 1
                  let top = Infinity
                  let bottom = -Infinity
                  for (const c of frame.children) {
                    if (!c.offsetHeight || getComputedStyle(c).position === 'absolute') continue
                    top = Math.min(top, c.offsetTop)
                    bottom = Math.max(bottom, c.offsetTop + c.offsetHeight)
                  }
                  const pb = parseFloat(getComputedStyle(frame).paddingBottom)
                  return Math.max(0, Math.round((bottom + pb - frame.clientHeight) * z), Math.round(-top * z))
                })()
              : 0,
            offenders: offenders.slice(0, 4),
            progress: Number(document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
          }
        })
        const file = path.join(dir, `${String(i + 1).padStart(2, '0')}-${slides[i].id}.jpg`)
        await page.screenshot({ path: file, type: 'jpeg', quality: 82 })
        results.layout.push({ page: tag || 'landing', viewport: `${w}x${h}`, theme, slide: i + 1, id: slides[i].id, reached: idx === i, ...m })
      }
      await ctx.close()
      const rows = results.layout.filter((r) => r.page === (tag || 'landing') && r.viewport === `${w}x${h}` && r.theme === theme)
      const bad = rows.filter((r) => !r.reached || r.docOverflowX > 0 || r.offenders.length || r.progress !== r.slide || r.scrolls || r.cut > 1 || r.fit < 0.6)
      const scaled = rows.filter((r) => r.fit < 0.999).map((r) => `${r.id} ×${r.fit.toFixed(2)}`)
      check(`Layout ${tag ? 'Knowledge Management ' : ''}${w}x${h}-${theme}: ${slides.length} blocks reached by keyboard; none scrolls inside or is cut (too tall a block is drawn smaller); no horizontal overflow, cut headlines or panel titles, nothing under the widget, progress in sync`, bad.length === 0, bad.length ? JSON.stringify(bad.map((b) => ({ slide: b.slide, off: b.offenders, x: b.docOverflowX, cut: b.cut, scrolls: b.scrolls, fit: b.fit })) ) : scaled.length ? `drawn smaller to fit: ${scaled.join(', ')}` : 'every block fits at full size')
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
    bar: !!document.querySelector('.hero__bar form.prompt .prompt__input'),
    label: document.querySelector('.hero__bar label')?.textContent.trim(),
  }))
  check('Hero: NEURONIUM, then “Run AI Business with AI Operating System” (no full stop) and the input bar under it', hero.word === 'Neuronium' && hero.letters === 'NEURONIUM' && hero.line === 'Run AI Business with AI Operating System' && hero.bar && hero.label === 'Your business task', hero.line)
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
    oss: [document.querySelector('.nav__oss')?.textContent.trim(), document.querySelector('.nav__oss')?.getAttribute('href'), document.querySelector('.nav__oss')?.nextElementSibling?.classList.contains('nav__cta')],
    bg: getComputedStyle(document.querySelector('.nav')).backgroundColor,
    counter: !!document.querySelector('.topbar__counter, .slide-index, .theme-switch'),
  }))
  check(
    `Top menu: transparent, logo is the two letters Nr (no tile), only the open sections (${NAV.map(([l]) => l).join(' · ')}), “Open source” (GitHub) next to “Open Platform”`,
    nav.logo === 'Nr' && !nav.logoTile && nav.items.join('|') === NAV.map(([l]) => l).join('|') && nav.cta === 'Open Platform' && nav.ctaHref === PLATFORM && nav.oss[0] === 'Open source' && nav.oss[1] === GITHUB && nav.oss[2] && /rgba\(0, 0, 0, 0\)|transparent/.test(nav.bg) && !nav.counter,
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
          tag: x.querySelector('.pr-plan__cta')?.tagName,
          bg: getComputedStyle(x.querySelector('.pr-plan__cta')).backgroundColor,
          bgImage: getComputedStyle(x.querySelector('.pr-plan__cta')).backgroundImage,
          includes: [...x.querySelectorAll('.pr-plan__list li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim()).join('|'),
          extra: x.querySelectorAll('.pr-grid, .pr-plan__tag, .pr-plan__note').length,
        })),
        title: s.querySelector('.pr__title')?.textContent.trim(),
        copy: s.querySelectorAll('.pr__copy, .pr__note').length,
      }
    })
    const want = [
      ['Own model', '$ 19 / month', 'Bring your own Provider Key', 'Start Free Trial', 'AI Superagent|AI Management|Your AI Costs', 'own', ''],
      ['Solo', '$ 99 / month', 'For a solo builder', 'Start Free Trial', 'AI Superagent|AI Management|500 AI Workforce hours', 'solo', 'medium'],
      ['Team', '$ 490 / month', 'Up to 10 people', 'Start Free Trial', 'AI Superagent|AI Management|Shared workspace|5 000 AI Workforce hours', 'team', 'medium'],
      ['Scale', 'Contact us', 'More than 10 people', 'Contact sales', 'AI Superagent|AI Management|Shared workspace|Custom AI Workforce', '', ''],
    ]
    const asWanted = pr.plans.length === 4 && want.every(([n, p, l, c, inc, id, model], k) => {
      const x = pr.plans[k]
      // the spaces around the price are margins, not text
      return x.name === n && x.price.replace(/\s+/g, '') === p.replace(/\s+/g, '') && x.line === l && x.cta === c && (c === 'Start Free Trial' ? x.href === `${PLATFORM}?plan=${id}${model ? `&model=${model}` : ''}` : x.tag === 'BUTTON') && x.includes === inc && x.extra === 0
    })
    // every button is white — the highlighted plan's too
    const white = pr.plans.every((x) => x.bg === pr.plans[0].bg && x.bgImage === 'none' && x.bg.match(/\d+/g).slice(0, 3).every((c) => Number(c) > 235))
    check(
      'Pricing: Own model $19 first, then Solo and Team on the Medium model ($99 with 500 AI Workforce hours; $490 with 5 000 and a shared workspace), with Start Free Trial (to the platform, with the plan and level), and Scale “Contact us” with Contact sales — no other copy; every button white',
      asWanted && white && pr.title === 'Pricing' && pr.copy === 0,
      pr.plans.map((x) => `${x.name} ${x.price} · ${x.cta} → ${x.href.slice(0, 40) || x.tag} · ${x.bg}`).join(' | '),
    )
    // the model level inside each plan: the price, the last included item and the trial link follow it
    const pick = async (plan, level) => {
      const card = page.locator('.slide[data-state="active"] .pr-plan', { hasText: plan })
      await card.getByRole('radio', { name: level }).click()
      await sleep(250)
      return card.evaluate((x) => ({
        price: x.querySelector('.pr-plan__price')?.textContent.replace(/\s+/g, ''),
        last: [...x.querySelectorAll('.pr-plan__list li')].slice(-1).map((li) => li.textContent.replace(/\s+/g, ' ').trim()).join('|'),
        model: [...x.querySelectorAll('.pr-plan__list li')].some((li) => / model$/.test(li.textContent.trim())),
        href: x.querySelector('.pr-plan__cta')?.getAttribute('href'),
        levels: [...x.querySelectorAll('[role="radio"]')].map((r) => `${r.querySelector('.pr-tiers__l')?.textContent.trim()}${r.querySelector('svg') ? '' : ' (no icon)'}`).join('|'),
        multiplier: /×\s?\d/.test(x.textContent),
        checked: x.querySelector('[role="radio"][aria-checked="true"] .pr-tiers__l')?.textContent.trim(),
      }))
    }
    const levels = [
      ['Solo', 'Low', '$59/month', '300 AI Workforce hours', 'low'],
      ['Solo', 'High', '$190/month', '1 000 AI Workforce hours', 'high'],
      ['Team', 'Low', '$290/month', '3 000 AI Workforce hours', 'low'],
      ['Team', 'High', '$990/month', '10 000 AI Workforce hours', 'high'],
    ]
    const seen = []
    for (const [plan, level, price, last, model] of levels) {
      const r = await pick(plan, level)
      seen.push({ plan, level, ok: r.price === price && r.last === last && !r.model && r.checked === level && !r.multiplier && r.href === `${PLATFORM}?plan=${plan.toLowerCase()}&model=${model}`, r })
    }
    const solo = seen[0].r.levels
    const team = seen[2].r.levels
    check(
      'Pricing: inside Solo and Team a model level is chosen — a switch of a mark and a word for each level, with no multipliers; Solo: Low $59 · Medium $99 · High $190 with 300 · 500 · 1 000 AI Workforce hours; Team: Low $290 · Medium $490 · High $990 with 3 000 · 5 000 · 10 000 — the price, the hours and the trial link follow it, and the list does not name the model',
      solo === 'Low|Medium|High' && team === solo && seen.every((x) => x.ok),
      seen.map((x) => `${x.plan} ${x.level} ${x.r.price}${x.ok ? '' : ' ✗ ' + JSON.stringify(x.r)}`).join(' · '),
    )
    await page.locator('.slide[data-state="active"] .pr-plan', { hasText: 'Scale' }).getByRole('button', { name: 'Contact sales' }).click()
    await sleep(500)
    const sales = await page.evaluate(() => ({
      open: !!document.querySelector('.cw__card[role="dialog"]'),
      subject: document.querySelector('.cw__card input[name="subject"]')?.value,
      focus: document.activeElement?.getAttribute('name'),
    }))
    await page.keyboard.press('Escape')
    await sleep(300)
    check('Pricing: “Contact sales” on Scale opens the “Write to us” widget, about the Scale plan, with the caret in the email field', sales.open && sales.subject === 'Scale plan' && sales.focus === 'email' && (await page.locator('.cw__card').count()) === 0, JSON.stringify(sales))
  }

  // FAQ
  if (has('faq')) {
    await go('faq')
    const closedAtFirst = await page.evaluate(() => document.querySelectorAll('.slide[data-state="active"] .faq__q[aria-expanded="true"]').length === 0)
    check('FAQ: no question is open at first', closedAtFirst)
    await page.getByRole('button', { name: /Who stays in control/ }).click()
    await sleep(700)
    const faqState = await page.evaluate(() => ({
      open: [...document.querySelectorAll('.slide[data-state="active"] .faq__q[aria-expanded="true"]')].map((b) => b.textContent),
      text: document.querySelector('.slide[data-state="active"] .faq__item.is-open .faq__a')?.textContent ?? '',
    }))
    check('FAQ: answers open in place, one at a time — opening one closes the others', faqState.open.length === 1 && /Who stays in control/.test(faqState.open[0]) && /stay with people/.test(faqState.text), faqState.text.slice(0, 60))
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
        (ready.length > 4 ? today.a.includes(`${ready.length} AI employees`) : ready.every((x) => today.a.includes(x.name))) && (has('custom') || !today.qs.some((q) => /create my own/i.test(q))) && (!has('pricing') || today.qs.includes('What is an AI Workforce hour?')),
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
    placeholder: document.querySelector('.fin__bar .prompt__input')?.getAttribute('placeholder'),
    early: /Get Early Access/i.test(document.querySelector('.slide[data-state="active"]').innerText),
    same: !!document.querySelector('.fin__bar form.prompt .prompt__go'),
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
  await Promise.all([hand.waitForURL((u) => u.href.startsWith(PLATFORM), { timeout: 5000 }), handActive.getByRole('button', { name: 'Send' }).click()])
  await hand.goto(`${BASE}#start`)
  await hand.waitForTimeout(1600)
  const task = 'An AI concierge for boutique hotels'
  await hand.locator('.slide[data-state="active"]').getByRole('textbox', { name: 'Your business task' }).fill(task)
  await Promise.all([hand.waitForURL((u) => u.href.startsWith(PLATFORM) && u.searchParams.has('task'), { timeout: 5000 }), hand.keyboard.press('Enter')])
  await hand.close()
  const withTask = landed.find((u) => new URL(u).searchParams.get('task') === task)
  check(
    'Final: “Run Your AI Business”, “with Neuronium” smaller below, then just the input bar (“Describe your business task”, no Get Early Access); sending opens the platform, with the written task carried over (?task=)',
    fin.title === 'Run Your AI Business' && !fin.centerMark && fin.sub === 'with Neuronium' && fin.status === 0 && fin.placeholder === 'Describe your business task' && fin.same && !fin.early && landed[0] === PLATFORM && !!withTask,
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
      text: foot?.innerText ?? '',
      mail: foot?.querySelectorAll('a[href^="mailto:"]').length ?? -1,
      byHref: foot?.querySelector('.fin__by')?.getAttribute('href'),
      logo: logo ? { loaded: logo.complete && logo.naturalWidth > 0, h: Math.round(logo.getBoundingClientRect().height) } : null,
      social: [...(foot?.querySelectorAll('.fin__social a') ?? [])].map((x) => [x.getAttribute('aria-label'), x.getAttribute('href'), !!x.querySelector('svg path')]),
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
    ['GitHub', /^https:\/\/github\.com\/[^/]+$/],
  ]
  const legalWant = [
    ['Terms of Use', /^https:\/\/.+\/terms\/?$/],
    ['Privacy Policy', /^https:\/\/.+\/privacy\/?$/],
  ]
  check(
    'Contacts: last in the menu, after FAQ — it opens the final block, whose foot has the orange AIT logo (andre.technology), LinkedIn · X · Instagram · TikTok · YouTube · GitHub, Terms of Use and Privacy Policy; no “Created by”, no support address (that is the widget)',
    NAV.at(-1)[0] === 'Contacts' && ct.last && ct.title === 'Run Your AI Business' && ct.active === 'Contacts' && ct.blocks === SLIDES.length &&
      ct.by === '' && !/Created by/i.test(ct.text) && ct.mail === 0 && /andre\.technology/.test(ct.byHref) && ct.logo?.loaded && ct.logo.h >= 14 &&
      ct.social.length === socialWant.length && socialWant.every(([l, re], k) => ct.social[k][0] === l && re.test(ct.social[k][1]) && ct.social[k][2]) &&
      ct.legal.length === legalWant.length && legalWant.every(([l, h], k) => ct.legal[k][0] === l && (typeof h === 'string' ? ct.legal[k][1] === h : h.test(ct.legal[k][1]))) &&
      ct.newTab,
    JSON.stringify({ by: ct.by, logo: ct.logo, social: ct.social.map((x) => x[1]), legal: ct.legal.map((x) => x[1]) }),
  )
  // The way out to the products: Platform (block 2) and Knowledge Management (its block)
  const outs = {}
  await go('context')
  outs.platform = await page.evaluate(() => {
    const a = document.querySelector('.slide[data-state="active"] .ctx__more')
    return a && { text: a.textContent.trim(), href: a.getAttribute('href'), seen: a.getBoundingClientRect().height > 0, bg: getComputedStyle(a).backgroundColor }
  })
  if (OPEN_DEPTS.some((dpt) => dpt.id === 'management' && dpt.members.length === 1 && dpt.members[0].n === 1)) {
    await go('management')
    outs.km = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      const a = s.querySelector('.dept__more')
      const desc = s.querySelector('.dept__desc')?.getBoundingClientRect()
      const el = s.querySelector('.dept__strip')?.getBoundingClientRect()
      const r = a?.getBoundingClientRect()
      return a && { text: a.textContent.trim(), href: a.getAttribute('href'), seen: r.height > 0, bg: getComputedStyle(a).backgroundColor, order: !!desc && !!el && desc.bottom <= r.top + 1 && r.bottom <= el.top + 1 }
    })
  }
  check(
    `Ways out, as quiet links without a background: “About Platform” under the AI Superagent title → ${PLATFORM}${outs.km !== undefined ? `; “About Knowledge Management” under its line, above the Km element → its page, ${KM_ABOUT}` : ''}`,
    outs.platform?.text === 'About Platform' && outs.platform.href === PLATFORM && outs.platform.seen && outs.platform.bg === 'rgba(0, 0, 0, 0)' &&
      (outs.km === undefined || (outs.km?.text === 'About Knowledge Management' && outs.km.href === KM_ABOUT && outs.km.seen && outs.km.bg === 'rgba(0, 0, 0, 0)' && outs.km.order)),
    JSON.stringify(outs),
  )
  // Cases: rows of pictures and titles flow by, one each way; pointing holds a row; All cases opens every case with a search
  if (has('cases')) {
    await go('cases')
    await sleep(1600)
    const shift = () => page.$$eval('.slide[data-state="active"] .cs-track', (t) => t.map((e) => new DOMMatrix(getComputedStyle(e).transform).m41))
    const x0 = await shift()
    await sleep(900)
    const x1 = await shift()
    const row = await page.locator('.slide[data-state="active"] .cs-row').first().boundingBox()
    await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2)
    await sleep(300)
    const h0 = await shift()
    await sleep(900)
    const h1 = await shift()
    await page.mouse.move(8, 450)
    const cs = await page.evaluate(() => {
      const s = document.querySelector('.slide[data-state="active"]')
      const own = [...s.querySelectorAll('.cs-item')].filter((c) => c.tabIndex >= 0 && c.getAttribute('aria-hidden') !== 'true')
      return {
        title: s.querySelector('.cs__title')?.textContent.trim(),
        rows: s.querySelectorAll('.cs-row').length,
        own: own.map((c) => ({
          title: c.querySelector('.cs-title')?.textContent.trim(),
          picture: c.querySelectorAll('.cs-pic svg.ca *, .cs-pic img').length,
          go: c.querySelector('.cs-go')?.textContent.trim(),
          link: c.tagName === 'A' ? c.getAttribute('href') : null,
        })),
        all: s.querySelector('.cs-all')?.textContent.replace(/\s+/g, ' ').trim(),
        allBelow: (() => {
          const rows = s.querySelector('.cs__rows')?.getBoundingClientRect()
          const all = s.querySelector('.cs-all')
          return !!rows && !!all && all.getBoundingClientRect().top >= rows.bottom - 1 && getComputedStyle(all).backgroundColor === 'rgba(0, 0, 0, 0)'
        })(),
      }
    })
    await page.locator('.slide[data-state="active"] .cs-all').click()
    await sleep(600)
    const ix = await page.evaluate(() => ({
      dialog: !!document.querySelector('.cx[role="dialog"][aria-modal="true"]'),
      cards: document.querySelectorAll('.cx .cs-item').length,
      focus: document.activeElement?.getAttribute('type'),
    }))
    const word = cs.own[1]?.title.split(' ').find((w) => w.length > 4) ?? 'calls'
    await page.keyboard.type(word)
    await sleep(300)
    const hits = await page.$$eval('.cx .cs-title', (t) => t.map((e) => e.textContent))
    await page.locator('.cx__search input').fill('zzzz')
    const none = await page.locator('.cx__none').innerText().catch(() => '')
    const at0 = await activeIndex(page)
    await page.mouse.move(700, 500)
    await page.mouse.wheel(0, 700)
    await sleep(1100)
    const held = (await activeIndex(page)) === at0
    await page.keyboard.press('Escape')
    await sleep(300)
    const closed = (await page.locator('.cx').count()) === 0 && (await page.evaluate(() => document.activeElement?.classList.contains('cs-all')))
    const flows = x0.every((v, k) => Math.abs(v - x1[k]) > 4) && Math.sign(x1[0] - x0[0]) !== Math.sign(x1[1] - x0[1])
    check(
      'Cases: after Management in the menu, two rows of pictures with titles flow by, one each way; pointing holds a row; each case is reached once by Tab and says “Soon” until it has a link; “All cases”, a quiet link under the rows, opens every case with a search (empty state, the block holds still, Escape closes)',
      cs.title === 'Cases' && cs.rows === 2 && flows && Math.abs(h0[0] - h1[0]) < 1 && Math.abs(h0[1] - h1[1]) > 4 &&
        cs.own.length === ix.cards && cs.own.every((c) => c.title && c.picture > 5 && (c.link ? c.go === '' : c.go === 'Soon')) && /All cases/.test(cs.all) && cs.allBelow &&
        ix.dialog && ix.focus === 'search' && hits.length >= 1 && hits.every((t) => t.toLowerCase().includes(word.toLowerCase())) && /Nothing matches/.test(none) && held && closed &&
        NAV.findIndex(([, id]) => id === 'cases') === NAV.findIndex(([, id]) => id === 'pricing') - 1,
      JSON.stringify({ flows, held: [h0, h1].map((h) => h.map(Math.round)), cases: cs.own.length, index: ix.cards, search: `${word} → ${hits.length}` }),
    )
  }

  // The bar on every block: it shows what it does, then “Try it yourself”; the visitor can take it at any moment
  await go('hero')
  const tryHero = await page.waitForSelector('.slide[data-state="active"] .hero__bar .prompt.is-try', { timeout: 25000 }).then(() => true).catch(() => false)
  const invite = await page.evaluate(() => document.querySelector('.slide[data-state="active"] .prompt__try')?.textContent.trim())
  await go('context')
  await sleep(2600)
  await page.locator('.slide[data-state="active"] .prompt__input').click()
  await sleep(2500)
  const taken = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return {
      own: s.querySelector('.prompt')?.classList.contains('is-own'),
      demo: s.querySelectorAll('.prompt__q').length,
      way: s.querySelectorAll('.cb line[display="inline"]').length,
      placeholder: s.querySelector('.prompt__input')?.getAttribute('placeholder'),
    }
  })
  await page.keyboard.press('Tab')
  await sleep(200)
  check(
    'Input bar: the hero types example tasks, then says “Try it yourself”; clicking into the Superagent bar stops its demo (no way runs) and it waits for the visitor’s task',
    tryHero && invite === 'Try it yourself' && taken.own && taken.demo === 0 && taken.way === 0 && taken.placeholder === 'Give the AI Superagent a task',
    JSON.stringify({ tryHero, invite, taken }),
  )

  // Write to us: the widget in the corner
  {
    const wp = await ctx.newPage()
    const posted = []
    let status = 200
    await wp.route('**/api/contact', (r) => {
      posted.push(r.request().postDataJSON())
      return r.fulfill({ status, contentType: 'application/json', body: '{}' })
    })
    await wp.goto(`${BASE}#faq`)
    await wp.waitForTimeout(1500)
    const on = (await wp.locator('.cw__launch').count()) === 1
    await wp.locator('.cw__launch').click()
    await wp.waitForTimeout(400)
    const opened = await wp.evaluate(() => ({ dialog: !!document.querySelector('.cw__card[role="dialog"]'), title: document.querySelector('.cw__title')?.textContent.trim(), sub: document.querySelector('.cw__sub')?.textContent.trim(), fields: [...document.querySelectorAll('.cw__field > span')].map((x) => x.textContent.trim()).join('|'), focus: document.activeElement?.getAttribute('name') }))
    await wp.getByRole('button', { name: 'Send' }).click()
    const noEmail = await wp.locator('.cw__status').innerText()
    const before = await activeIndex(wp)
    await wp.mouse.move(500, 300)
    await wp.mouse.wheel(0, 700)
    await wp.waitForTimeout(1200)
    const stayed = (await activeIndex(wp)) === before
    await wp.locator('.cw__card input[name="email"]').fill('anna@example.com')
    await wp.locator('.cw__card input[name="subject"]').fill('A question about Solo')
    await wp.locator('.cw__card textarea').fill('Can I switch plans later?')
    await wp.getByRole('button', { name: 'Send' }).click()
    const sent = await wp.waitForSelector('.cw__done', { timeout: 4000 }).then(() => wp.locator('.cw__done p').innerText()).catch(() => '')
    status = 503
    await wp.getByRole('button', { name: 'Write another' }).click()
    await wp.locator('.cw__card input[name="subject"]').fill('Hello')
    await wp.getByRole('button', { name: 'Send' }).click()
    await wp.waitForTimeout(600)
    const failed = { text: await wp.locator('.cw__status').innerText(), href: await wp.locator('.cw__status a').getAttribute('href').catch(() => null) }
    await wp.keyboard.press('Escape')
    await wp.waitForTimeout(300)
    const closed = (await wp.locator('.cw__card').count()) === 0 && (await wp.evaluate(() => document.activeElement?.classList.contains('cw__launch')))
    await wp.close()
    check(
      'Write to us: a button in the bottom-right corner opens a card (email, subject, optional message; “We reply by email”); it asks for what is missing, holds the block still, sends to /api/contact, says where the reply goes — and offers a plain email if sending fails; Escape closes it',
      on && opened.dialog && opened.title === 'Write to us' && opened.sub === 'We reply by email.' && opened.fields === 'Your email|Subject|Message optional' && opened.focus === 'email' &&
        /email/i.test(noEmail) && stayed && posted[0]?.email === 'anna@example.com' && posted[0]?.subject === 'A question about Solo' && posted[0]?.message === 'Can I switch plans later?' &&
        /anna@example\.com/.test(sent) && /support@neuronium\.ai/.test(failed.text) && failed.href?.startsWith(`mailto:${SUPPORT}?subject=Hello`) && closed,
      JSON.stringify({ opened, noEmail, stayed, sent, failed: failed.text.slice(0, 50), posted: posted.length }),
    )
  }

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

/** The AI Knowledge Management page: a deck of its own — its generator, its parts, its menu, its end. */
async function kmPagePass(browser) {
  const url = new URL('knowledge-management/', BASE).href
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const landed = []
  await ctx.route(`${new URL(KM).origin}/**`, (r) => {
    landed.push(r.request().url())
    return r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>KM</title>' })
  })
  const page = await ctx.newPage()
  trackErrors(page, 'knowledge-management')
  const go = async (id) => {
    await page.evaluate((h) => (location.hash = h), `#${id}`)
    await sleep(1300)
  }
  await page.goto(url, { waitUntil: 'networkidle' })
  await sleep(1200)
  const top = await page.evaluate(() => ({
    h1: [...document.querySelectorAll('.kd-h1 .mask')].map((m) => m.textContent.trim()).join(' '),
    blocks: document.querySelectorAll('.slide').length,
    items: [...document.querySelectorAll('.nav__menu .nav__item')].map((b) => b.textContent.trim()).join('|'),
    cta: [document.querySelector('.nav__cta')?.textContent.trim(), document.querySelector('.nav__cta')?.getAttribute('href')],
    home: document.querySelector('.nav__brand')?.getAttribute('href'),
    bar: !!document.querySelector('.kd-hero-bar form.prompt .prompt__input'),
  }))
  await page.keyboard.press('PageDown')
  await sleep(1300)
  const turned = await activeIndex(page)
  check(
    'Knowledge Management page: a deck like the landing — its own blocks, one gesture per block; the menu reads Report · How it works · Graph · Use cases · Pricing · FAQ · Contacts, its button is “Open Platform” as on the landing, and the logo leads back to the landing',
    top.h1 === 'AI Knowledge Management' && top.blocks === KM_SLIDES.length && top.items === KM_NAV.map((x) => x.label).join('|') && top.cta[0] === 'Open Platform' && top.cta[1] === PLATFORM && top.home === '/' && top.bar && turned === 1,
    JSON.stringify(top),
  )
  // how it works: one block — a question is typed into the bar, then each step plays its own animation, and the report is composed
  // (the menu check above already turned to it; arrive afresh so the demo starts from its first question)
  await go('start')
  await go('how')
  const lights = () => page.evaluate(() => document.querySelector('.slide[data-state="active"] .kh-steps li.is-now')?.textContent.trim() ?? '')
  const typing = await page
    .waitForFunction(() => {
      // the letters typed so far (the full question is in the screen-reader copy and the ghost)
      const t = document.querySelector('.slide[data-state="active"] .kd-how__demo .prompt__q .type > span:nth-child(2)')?.textContent ?? ''
      return t.length > 3 && t.length < 30
    }, null, { timeout: 6000 })
    .then(() => true)
    .catch(() => false)
  const askLit = await lights()
  const understand = await page
    .waitForSelector('.slide[data-state="active"] .kh-q .kh-mark', { timeout: 8000 })
    .then(async () => {
      await sleep(1500)
      return page.evaluate(() => ({
        marks: [...document.querySelectorAll('.slide[data-state="active"] .kh-mark')].map((m) => `${m.querySelector('.kh-mark__w').textContent}=${m.querySelector('.kh-mark__as').textContent}`).join('|'),
        lit: document.querySelector('.slide[data-state="active"] .kh-steps li.is-now')?.textContent.trim(),
      }))
    })
    .catch(() => null)
  const search = await page
    .waitForFunction(() => document.querySelectorAll('.slide[data-state="active"] .kg--lg .kg-n.is-lit').length === 4, null, { timeout: 8000 })
    .then(() =>
      page.evaluate(() => ({
        lit: [...document.querySelectorAll('.slide[data-state="active"] .kg--lg .kg-n.is-lit text')].map((t) => t.textContent.trim()).join('|'),
        records: document.querySelector('.slide[data-state="active"] .kh-walked b')?.textContent.trim(),
        labels: document.querySelectorAll('.slide[data-state="active"] .kg-e text, .slide[data-state="active"] .kg-n__t, .kp-graph__legend').length,
        step: document.querySelector('.slide[data-state="active"] .kh-steps li.is-now')?.textContent.trim(),
      })),
    )
    .catch(() => null)
  const count = await page
    .waitForSelector('.slide[data-state="active"] .kh-calc', { timeout: 6000 })
    .then(async () => {
      await sleep(1900)
      return page.evaluate(() => ({
        items: [...document.querySelectorAll('.slide[data-state="active"] .kh-calc__item')].map((x) => [...x.children].map((c) => c.textContent.trim()).join(' ')).join('|'),
        result: [...(document.querySelector('.slide[data-state="active"] .kh-calc__result')?.children ?? [])].map((c) => c.textContent.trim()).join(' '),
        step: document.querySelector('.slide[data-state="active"] .kh-steps li.is-now')?.textContent.trim(),
      }))
    })
    .catch(() => null)
  const report = await page
    .waitForSelector('.slide[data-state="active"] .kh .kr-sheet .kr-title', { timeout: 6000 })
    .then(async () => {
      await sleep(2400)
      return page.evaluate(() => {
        const a = document.querySelector('.slide[data-state="active"]')
        const s = a.querySelector('.kr-sheet')
        const bar = a.querySelector('.kd-how__demo .prompt')
        return {
          title: s.querySelector('.kr-title')?.textContent.trim(),
          ring: [s.querySelector('.kr-ring')?.getAttribute('data-v'), s.querySelector('.kr-ring__n')?.textContent.replace(/\s+/g, '')].join(' '),
          figs: [...s.querySelectorAll('.kr-fig__v')].map((f) => f.textContent.replace(/\s+/g, '')).join(' '),
          parts: [...s.querySelectorAll('.kr-part h4')].map((h) => h.textContent.trim()).join('|'),
          badges: [...s.querySelectorAll('.kr-badge')].map((b) => b.textContent.trim()).join('|'),
          above: s.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1,
          step: a.querySelector('.kh-steps li.is-now')?.textContent.trim(),
          steps: [...a.querySelectorAll('.kh-steps li')].map((x) => x.textContent.trim()).join('|'),
        }
      })
    })
    .catch(() => null)
  check(
    'Knowledge Management page: “How it works” is the one block that shows a report being made — the question is typed into the bar (01 Ask); its words are recognised (02 Understand); the company graph appears and the question walks it, records counted, with no link labels or legend (03 Search the graph); what was found is counted (04 Count); and the report is composed over the bar — ring against plan, figures, findings with statuses, limitations, sources (05 Compose the report)',
    typing && askLit === '01Ask' &&
      understand?.marks === 'Why=Root cause|Cyprus AI market review=Goal|at risk=Verdict' && understand.lit === '02Understand' &&
      search?.lit === 'Cyprus AI market review|Draft the article|Proofread & publish|Collect market sources' && Number(search.records) > 0 && search.labels === 0 && search.step === '03Search the graph' &&
      count?.items === '33% done|60% expected by now' && count.result === '−27 pp at risk' && count.step === '04Count' &&
      report?.title === 'Root-cause report — Cyprus AI market review' && report.ring === '33 33%' && report.figs === '−27pp 4 7' && report.parts === 'Findings|Limitations|Sources' && report.badges === 'Calculated|Confirmed' && report.above && report.step === '05Compose the report' &&
      report.steps === '01Ask|02Understand|03Search the graph|04Count|05Compose the report' && !KM_SLIDES.some((x) => ['report', 'access', 'graph', 'rules'].includes(x.id)),
    JSON.stringify({ typing, askLit, understand, search, count, report }),
  )
  // its use cases: the landing's Cases, only Knowledge Management's; “All” opens every case filtered by it
  await go('cases')
  const uses = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return {
      title: s.querySelector('.cs__title')?.textContent.trim(),
      cards: [...s.querySelectorAll('.cs-item:not([aria-hidden="true"]) .cs-title')].map((t) => t.textContent.trim()),
      all: s.querySelector('.cs-all')?.textContent.replace(/\s+/g, ' ').trim(),
    }
  })
  await page.locator('.slide[data-state="active"] .cs-all').click()
  await sleep(600)
  const ix = await page.evaluate(() => ({
    title: document.querySelector('.cx__title')?.textContent.replace(/\s+/g, ' ').trim(),
    on: document.querySelector('.cx__topic[aria-pressed="true"]')?.textContent.replace(/\d+/g, '').trim(),
    cards: document.querySelectorAll('.cx .cs-item').length,
  }))
  await page.locator('.cx__topic', { hasText: 'All' }).click()
  await sleep(300)
  const everyCase = await page.$$eval('.cx .cs-item', (c) => c.length)
  await page.keyboard.press('Escape')
  await sleep(400)
  check(
    'Knowledge Management page: its use cases are the landing’s Cases block with only Knowledge Management’s cases; “All Knowledge Management cases” opens every case filtered by it, and the filter can be cleared',
    uses.title === 'Use cases' && uses.cards.length === KM_CASES.length && uses.cards.every((t) => KM_CASES.includes(t)) && /All Knowledge Management cases/.test(uses.all) && ix.title === `Knowledge Management cases ${KM_CASES.length}` && ix.on === 'Knowledge Management' && ix.cards === KM_CASES.length && everyCase === CASE_COUNT,
    JSON.stringify({ ...uses, ix, everyCase }),
  )
  await go('pricing')
  const plans = await page.$$eval('.slide[data-state="active"] .pr-plan__name', (n) => n.map((x) => x.textContent.trim()).join('|'))
  await go('faq')
  const faq = await page.evaluate(() => ({
    open: document.querySelectorAll('.slide[data-state="active"] .faq__q[aria-expanded="true"]').length,
    qs: [...document.querySelectorAll('.slide[data-state="active"] .faq__q-text')].map((q) => q.textContent.trim()),
  }))
  await go('start')
  const end = await page.evaluate(() => {
    const s = document.querySelector('.slide[data-state="active"]')
    return { title: s.querySelector('.fin__title')?.textContent.trim(), foot: s.querySelectorAll('.fin__social a').length, legal: s.querySelectorAll('.fin__legal a').length }
  })
  const bar = page.locator('.slide[data-state="active"] .prompt__input')
  await bar.fill('Who owns pricing?')
  await Promise.all([page.waitForURL((u) => u.href.startsWith(KM), { timeout: 6000 }).catch(() => {}), bar.press('Enter')])
  check(
    'Knowledge Management page: the same pricing as the landing, its own FAQ (nothing open at first, and it says what an AI Workforce hour is), and its own end — “Ask your company”, whose bar opens Knowledge Management with the question (?q=)',
    plans === 'Own model|Solo|Team|Scale' && faq.open === 0 && faq.qs[0] === 'What is AI Knowledge Management?' && faq.qs.length === 9 && faq.qs.includes('What is an AI Workforce hour?') && end.title === 'Ask your company' && end.foot === 6 && end.legal === 2 && landed.some((u) => new URL(u).searchParams.get('q') === 'Who owns pricing?'),
    JSON.stringify({ plans, faq: faq.qs.length, ...end, landed: landed.length }),
  )
  await ctx.close()
}

const browser = await chromium.launch(LAUNCH)
try {
  await functionalPass(browser)
  await kmPagePass(browser)
  if (!process.env.SKIP_LAYOUT) {
    await layoutPass(browser)
    await layoutPass(browser, { url: new URL('knowledge-management/', BASE).href, slides: KM_SLIDES, tag: 'km' })
  }
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
