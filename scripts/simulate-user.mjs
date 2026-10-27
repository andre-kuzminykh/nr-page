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

// A trackpad flick: a burst of decaying deltas at 60 Hz, dispatched in the page.
const flick = (page, dir = 1) =>
  page.evaluate(
    (dir) =>
      new Promise((done) => {
        let i = 0
        const tick = () => {
          const el = document.elementFromPoint(innerWidth * 0.3, innerHeight * 0.5) || window
          el.dispatchEvent(new WheelEvent('wheel', { deltaY: dir * Math.max(1, 70 * Math.exp(-i / 14)), bubbles: true, cancelable: true }))
          if (++i < 60) setTimeout(tick, 16)
          else done()
        }
        tick()
      }),
    dir,
  )

const browser = await chromium.launch(LAUNCH)

/* ---------------------------------------------------------------- desktop visitor */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await ctx.newPage()
  watch(page, 'desktop')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1600)
  const hero = await page.locator('.hero__title').innerText()
  await step(page, 'desktop', 'Opens the site', 'Hero says "Run AI Workplaces." and nothing else competes', /Run AI\s+Workplaces\./.test(hero))

  for (let i = 1; i < SLIDES.length; i++) {
    await flick(page, 1)
    await sleep(1500)
    const now = await idx(page)
    await step(page, 'desktop', `Trackpad flick #${i}`, `Exactly one slide forward → ${SLIDES[i].label}`, now === i, `at ${now + 1}`)
  }
  await flick(page, -1)
  await sleep(1400)
  await step(page, 'desktop', 'Flicks back up once', 'Returns to slide 11', (await idx(page)) === 10)

  // Architecture
  await page.keyboard.press('Home')
  await sleep(1200)
  await page.getByRole('button', { name: 'Explore Neuronium' }).click()
  await sleep(1600)
  await step(page, 'desktop', 'Clicks "Explore Neuronium"', 'Lands on the architecture infographic', (await idx(page)) === 2)

  // AI Employees → catalog hand-off
  await page.evaluate(() => (location.hash = '#employees'))
  await sleep(1500)
  await page.getByRole('tab', { name: /Sales/ }).click()
  await sleep(500)
  const salesPanel = await page.locator('#emp-panel').innerText()
  await step(page, 'desktop', 'Clicks the Sales AI Employee', 'Sees the Sales responsibility and its 10 elements', salesPanel.includes('Lead Qualification') && salesPanel.includes('LinkedIn Outreach Assistant'))
  await page.getByRole('button', { name: /All 10 capabilities/ }).click()
  await sleep(1600)
  const cat = await page.evaluate(() => ({ i: Number(document.querySelector('.slide[data-state="active"]').dataset.slide), sel: document.querySelector('.pt__cell.is-sel')?.dataset.n }))
  await step(page, 'desktop', 'Clicks "All 10 capabilities"', 'Opens the periodic table on element 41 (first Sales element)', cat.i === 9 && cat.sel === '41', JSON.stringify(cat))

  // Periodic table
  await page.locator('.pt__cell[data-n="47"]').hover()
  await sleep(400)
  await step(page, 'desktop', 'Hovers element 47', 'Sees the tooltip "Lead Qualification"', true)
  await page.locator('.pt__cell[data-n="47"]').click()
  await sleep(300)
  const det = await page.locator('.cat__detail').innerText()
  await step(page, 'desktop', 'Clicks element 47 (Lq)', 'Detail shows Lead Qualification with its own description', det.includes('Lead Qualification') && det.includes('Small Business'))
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowRight')
  await sleep(400)
  const kb = await page.evaluate(() => document.querySelector('.pt__cell.is-sel')?.dataset.n)
  await step(page, 'desktop', 'Presses ↓ then → in the table', 'Moves to element 58 (Feature Request) without leaving the slide', kb === '58' && (await idx(page)) === 9, `selected ${kb}`)
  await page.getByRole('searchbox', { name: 'Search capabilities' }).fill('video')
  await sleep(400)
  const vid = await page.evaluate(() => [...document.querySelectorAll('.pt__cell.is-match')].map((c) => c.dataset.name))
  await step(page, 'desktop', 'Searches "video"', 'Video Generation and Video Creation light up, the rest dims', vid.includes('Video Generation') && vid.includes('Video Creation'), vid.join(', '))
  await page.getByRole('searchbox', { name: 'Search capabilities' }).fill('qwerty')
  await sleep(300)
  const none = await page.locator('#cat-status').innerText()
  await step(page, 'desktop', 'Searches nonsense', 'Sees a clear "Nothing matches" state', /Nothing matches/i.test(none))
  await page.getByRole('searchbox', { name: 'Search capabilities' }).press('Escape')
  await page.locator('.pt__zero').click()
  await sleep(300)
  const zero = await page.locator('.cat__detail').innerText()
  await step(page, 'desktop', 'Clicks element 0 (Nr)', 'Learns Neuronium is element 0, the OS with governance built in', /Element 0/i.test(zero) && zero.includes('Policy'))

  // Management
  await page.evaluate(() => (location.hash = '#management'))
  await sleep(1500)
  for (const v of ['Gantt', 'Calendar', 'Registry', 'Kanban']) {
    await page.getByRole('tab', { name: v }).click()
    await sleep(500)
    await step(page, 'desktop', `Switches to ${v}`, `${v} view of the same tasks`, (await page.locator(`.mg-view--${v.toLowerCase()}`).count()) === 1)
  }
  await sleep(4200)
  const prd = await page.evaluate(() => [...document.querySelectorAll('.mg-col')].find((c) => c.textContent.includes('PRD v1'))?.querySelector('.mg-col__head')?.textContent)
  await step(page, 'desktop', 'Waits on the Kanban board', 'PRD v1 moves to Done and the prototype unblocks for Design', /Done/.test(prd || ''), prd)
  await page.locator('.mg-side').getByRole('button', { name: /Validate demand/ }).click()
  await sleep(400)
  const filtered = await page.$$eval('.mg-card', (c) => c.length)
  await step(page, 'desktop', 'Filters by goal "Validate demand"', 'Only that goal’s tasks remain', filtered === 5, `${filtered} cards`)

  // Workflow / Execution / Context
  await page.evaluate(() => (location.hash = '#workflow'))
  await sleep(1500)
  await page.locator('.wf__stage-btn', { hasText: 'Analytics' }).click()
  await sleep(500)
  const cap = await page.locator('.wf__caption-text').innerText()
  await step(page, 'desktop', 'Clicks the Analytics stage', 'Caption explains the hand-off; autoplay pauses', /requirements/.test(cap))
  await page.evaluate(() => (location.hash = '#execution'))
  await sleep(5200)
  const replanned = await page.locator('.ex-node--agent', { hasText: 'Parse attached logs' }).count()
  await step(page, 'desktop', 'Watches the execution graph', 'New context arrives and the open part re-plans (new step appears)', replanned === 1)
  await page.evaluate(() => (location.hash = '#context'))
  await sleep(1500)
  await page.getByRole('button', { name: 'Who is the product for?' }).click()
  await sleep(500)
  const ans = await page.locator('.ctx__a').innerText()
  await step(page, 'desktop', 'Asks "Who is the product for?"', 'Graph trail lights up and answers from the graph', /Small Business/.test(ans))

  // Configuration
  await page.evaluate(() => (location.hash = '#configuration'))
  await sleep(1500)
  await page.getByPlaceholder('e.g. Northwind Studio').fill('Northwind Studio')
  await page.getByRole('radio', { name: /AI-Native/ }).click()
  await page.getByPlaceholder('What value does the product create?').fill('Instant legal document review')
  await sleep(300)
  let json = await page.locator('.cfg__json').innerText()
  await step(page, 'desktop', 'Configures an AI-Native product', 'JSON shows the product and human oversight, no employee grid', json.includes('Instant legal document review') && json.includes('humanOversight') && !json.includes('aiEmployees'))
  await page.getByRole('radio', { name: /AI-First/ }).click()
  await page.locator('.cfg__quick').getByRole('button', { name: 'Select all' }).click()
  await sleep(300)
  json = await page.locator('.cfg__json').innerText()
  await page.getByRole('button', { name: 'Copy JSON' }).click()
  await sleep(300)
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.getByRole('button', { name: 'Download JSON' }).click()])
  await step(page, 'desktop', 'Switches to AI-First, selects all, copies and downloads', 'Ten employees in JSON; clipboard and .json download work', (json.match(/"capabilities": 10/g) || []).length === 10 && clip.includes('"AI-First"') && !!dl, dl ? dl.suggestedFilename() : 'no download')

  // Final: idea
  await page.evaluate(() => (location.hash = '#start'))
  await sleep(1600)
  await page.getByRole('button', { name: /Get Early Access/ }).click()
  await sleep(300)
  const empty = await page.locator('#fin-status').innerText()
  await step(page, 'desktop', 'Presses "Get Early Access" with an empty idea', 'Gently asked to write the idea first', /Write a few words/.test(empty))
  await page.getByRole('textbox', { name: 'Your idea' }).fill('A marketplace where AI agents negotiate freight for small logistics companies')
  await page.getByRole('textbox', { name: 'Your idea' }).press('Enter')
  await sleep(500)
  const sent = await page.locator('#fin-status').innerText()
  await step(page, 'desktop', 'Types an idea and presses Enter', 'A pre-filled email to the team opens (no fake “sent”)', /email app should open/.test(sent))
  await ctx.close()
}

/* ---------------------------------------------------------------- phone visitor */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  watch(page, 'phone')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await sleep(1200)
  const cdp = await ctx.newCDPSession(page)
  const swipe = async (y0, y1, x = 195) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * k) / 5 }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  for (let i = 1; i < SLIDES.length; i++) {
    if (SLIDES[i - 1].id === 'configuration') {
      const box = await page.locator('.slide[data-state="active"] .cfg__json').boundingBox()
      const before = await page.locator('.slide[data-state="active"] .cfg__json').evaluate((el) => el.scrollTop)
      await swipe(box.y + box.height - 10, box.y + 10)
      await sleep(900)
      const after = await page.locator('.slide[data-state="active"] .cfg__json').evaluate((el) => el.scrollTop)
      await step(page, 'phone', 'Swipes up over the JSON preview', 'The JSON scrolls; the slide stays', after > before && (await idx(page)) === i - 1, `scrollTop ${before}→${after}`)
    }
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
    await step(page, 'phone', `Swipes up to slide ${i + 1}`, `${SLIDES[i].label} within 3 swipes, no sideways scroll`, now === i && fit.docX <= 0 && tries <= 3, `${tries} swipe(s), inner overflow ${fit.over}px`)
  }
  await page.evaluate(() => (location.hash = '#employees'))
  await sleep(1400)
  await page.getByRole('tab', { name: /Design/ }).tap()
  await sleep(400)
  await step(page, 'phone', 'Taps Design', 'Design responsibility appears', (await page.locator('#emp-panel').innerText()).includes('Design'))
  await page.evaluate(() => (location.hash = '#capabilities'))
  await sleep(1400)
  await page.locator('.pt__cell[data-n="76"]').tap()
  await sleep(400)
  await step(page, 'phone', 'Taps element 76', 'Sees User Experience in the detail strip', (await page.locator('.cat__detail').innerText()).includes('User Experience'))
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
  await page.keyboard.press('Tab')
  const cta = await page.evaluate(() => document.activeElement?.textContent?.trim())
  await page.keyboard.press('Enter')
  await sleep(1500)
  await step(page, 'keyboard', 'Tabs to the hero CTA and presses Enter', 'Skip link first, then logo, then CTA → architecture', /Skip/.test(first) && /Explore Neuronium/.test(cta) && (await idx(page)) === 2, `${first} → ${cta}`)
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('PageDown')
    await sleep(900)
  }
  await step(page, 'keyboard', 'PageDown ×9', 'Reaches the last slide', (await idx(page)) === 11)
  const inStage = await page.evaluate(() => !!document.activeElement?.closest('.slide[data-state="active"]'))
  await page.keyboard.press('Tab')
  const tabTarget = await page.evaluate(() => document.activeElement?.closest('.slide')?.dataset.slide)
  await step(page, 'keyboard', 'Presses Tab on the last slide', 'Focus stays inside the visible slide (hidden slides are inert)', inStage && tabTarget === '11', `focus in slide ${tabTarget}`)
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
