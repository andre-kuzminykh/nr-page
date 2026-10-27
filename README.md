# Neuronium — Run AI Workplaces.

Interactive landing for **Neuronium**, the AI Operating System by Andre AI Technologies (a Dataist AI label).
Twelve full-screen modules, one gesture per module, over one continuous WebGL light field.

![Desktop, all 12 slides](docs/screenshots/sheets/1440x900.jpg)

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # serve dist/ at http://localhost:4173
```

Requires Node 20.19+ or 22.12+. The build is a static site (`dist/`) and can be hosted anywhere.

### Connection points (no fake sign-ups)

There is no registration backend in this project, so nothing pretends to submit:

| Variable | Used by | Default |
|---|---|---|
| `VITE_EARLY_ACCESS_URL` | “Get Early Access” links | `mailto:admin@andre.technology` (published on andre.technology) |
| `VITE_IDEA_ENDPOINT` | “Turn your Idea into Reality” input on the last slide | empty → opens a pre-filled email with the idea; when set → `POST {"idea","source"}` JSON |

Copy `.env.example` to `.env` to set them. See `src/config/links.ts`.

## Checks

```bash
npm run validate:data      # all 100 capabilities: names, order, numbering, unique element symbols
npm run validate:browser   # 12 slides × 6 viewports, overflow, navigation, catalog, forms, touch, reduced motion
npm run simulate           # simulated visitors: trackpad/desktop, phone with swipes, keyboard only
```

The browser scripts need Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`)
and a running `npm run preview` (override the URL with `BASE_URL=…`). Output goes to `validation/`.

Latest results (production build, headless Chromium with software WebGL):

- **Data** — 10 AI Employees × 10 = 100 capabilities (elements 1–100), exact canonical names and order.
- **Browser** — **36 / 36 checks passed** at 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 375×667: no horizontal overflow anywhere, no JavaScript errors. [Report](docs/validation/browser-report.md)
- **Simulated users** — **53 / 53 steps** behaved as expected; on a phone every slide is reached with one swipe. [Walkthrough with screenshots](docs/validation/user-walkthrough.md)

Screenshots: [desktop](docs/screenshots/desktop-1440x900), [phone](docs/screenshots/phone-390x844),
contact sheets for every viewport in [docs/screenshots/sheets](docs/screenshots/sheets), and
[reduced motion](docs/screenshots/reduced-motion-architecture.jpg).

## The 12 modules

| # | Module | What it does |
|---|---|---|
| 01 | Hero | “Run AI Workplaces.” — Build AI-Native products. Run AI-First businesses. |
| 02 | What is Neuronium | Separate tools (chats, automations, documents, agents…) assemble into one system with shared context. |
| 03 | Complete architecture | Neuronium (AI Governance inside: Policy · Access · Oversight · Control) → AI Business (AI Identity · AI Knowledge Graph · AI Superagent) → AI-Native above AI-First → 2×5 AI Employees → AI Agents · AI Workflows · AI Skills. |
| 04 | AI Business types | AI-Native vs AI-First: what it is, standard process, role of people, structure — with live control-loop diagrams. |
| 05 | AI Employees | Interactive 2×5 grid (Management selected), each with its responsibility and its 10 elements. |
| 06 | Management | AI Manager demo: one task registry shown as Kanban, Gantt, Calendar and Registry; goals/products/projects filters; dependencies; a task hands off from Analytics to Design. |
| 07 | How work moves | Illustrative idea-to-product path across real AI Employees; Management coordinates; SMM and Support alongside. |
| 08 | Execution | Live graph: fixed vs re-plannable steps, new context triggers re-planning, a skill is versioned after checks & tests. |
| 09 | Business context | Sources via MCP & integrations → AI Identity + AI Knowledge Graph (readable relationships, query trails) → AI Superagent. Superagent ≠ AI Manager. |
| 10 | Capabilities | **Periodic table**: Neuronium is element 0 (Nr); the 100 capabilities are elements 1–100, one period per AI Employee. Search, category rows, keyboard navigation, detail tile. |
| 11 | Business configuration | Pick AI-Native or AI-First, compose AI Employees, live JSON — copy or download. Nothing is deployed. |
| 12 | Turn your Idea into Reality | Write the idea straight into the input; “Get Early Access”; “Explore Capabilities”. |

## Product truth vs. website demo

- **Capability data** (`src/data/employees.ts`) carries an `availability` per capability:
  `available`, `in-development`, `planned` or `scope`. Everything is `scope` (“Product scope”) until
  confirmed — the catalog states that the map describes intended scope. Mark confirmed items there.
- **Illustrative** (labelled on screen, sample data, not connected to production): the AI Manager board,
  the cross-functional workflow, the execution run, the knowledge-graph slice and the configuration JSON.
- No invented customers, testimonials, metrics, pricing or integrations. Integrations are shown as
  examples referenced in the capability scope, with “availability varies”.

## Code map

```
src/
  App.tsx                         deck assembly, deep links (#capabilities …), focus & live region
  components/
    SlideController/              one gesture = one slide: wheel/trackpad, keys, touch, inner-scroll rules
    LightField/                   continuous WebGL background (shader.ts) + CSS fallback
    ProgressBar/                  bottom violet→orange progress rule
    Chrome/                       transparent top bar with the Nr logo (BrandMark)
    Element/                      capability-as-element tile, family colours
    ui/                           eyebrow, icons, AI Agents · Workflows · Skills line
  slides/                         one folder per module (component + CSS)
  data/
    employees.ts                  10 AI Employees × 10 capabilities, symbols, descriptions, availability
    architecture.ts               OS, governance, AI Business components, business types, execution units
    slides.ts                     slide order, labels and light composition per slide
  config/links.ts                 CTA destinations and the idea endpoint
scripts/                          validate-data, validate-browser, simulate-user
```

## Design notes

- **Palette** follows the Nr artwork: electric violet → magenta → pink → orange on `#0B0A0F`; dark theme only.
- **Type**: Geist (display & text) with JetBrains Mono for system labels — a nod to andre.technology.
- **Light field**: two anisotropic potentials (violet, orange) that orbit, rotate and stretch; they never separate,
  and their overlap computes a third light (lavender → magenta → pink → peach). Rendered as a clean synthetic
  gradient with animated film grain; resolution adapts to frame time, pauses in hidden tabs, freezes for reduced motion.
- **Motion**: ~820 ms slide transitions (fade, translate, soft blur); every element reveals automatically on arrival.
- **Navigation**: a trackpad flick with inertia counts as one gesture; inner areas (JSON preview, management board)
  scroll first, and the slide only turns after a pause at their edge. Arrow keys inside the periodic table, AI
  Employees grid and catalog search stay inside them; PageUp/PageDown always move slides.
- **Accessibility**: inactive slides are `inert`, slide changes are announced, all controls are keyboard
  reachable with visible focus, `prefers-reduced-motion` removes motion but keeps a still light overlap.
