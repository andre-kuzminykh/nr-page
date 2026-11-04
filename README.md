# Neuronium — Run AI Business with AI Operating System.

Interactive landing for **Neuronium**, the AI Operating System by Andre AI Technologies (a Dataist AI label).
Seventeen full-screen blocks, one gesture per block, over one continuous WebGL light field.
100 ready AI employees are shown as elements of a periodic table; Neuronium is element 0 (**Nr**).

![Desktop, all 17 blocks](docs/screenshots/sheets/1440x900.jpg)

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
| `VITE_EARLY_ACCESS_URL` | “Get Early Access” buttons | `mailto:admin@andre.technology` (published on andre.technology) |
| `VITE_IDEA_ENDPOINT` | “Turn your Idea into Reality” input on the last block | empty → opens a pre-filled email with the idea; when set → `POST {"idea","source"}` JSON |

Copy `.env.example` to `.env` to set them. See `src/config/links.ts`.

## Checks

```bash
npm run validate:data      # 100 AI employees: names, order, numbering, unique element symbols
npm run validate:browser   # 17 blocks × 7 viewports + functional checks (menu, table, departments, forms, touch…)
npm run simulate           # simulated visitors: trackpad/desktop, phone with swipes, keyboard only
```

The browser scripts need Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`)
and a running `npm run preview` (override the URL with `BASE_URL=…`). Output goes to `validation/`.

Latest results (production build, headless Chromium with software WebGL):

- **Data**: 10 departments × 10 = 100 AI employees (elements 1–100), with exact names, order and unique element symbols.
- **Browser**: **41 / 41 checks passed** at 1920×1080, 1440×900, 1280×800, 1024×768, 768×1024, 390×844 and 375×667.
  - Every block fits without inner scroll, with no horizontal overflow, cut headline lines or truncated panel titles, and no JavaScript errors.
  - The functional checks also cover the brain, department picking and hover details, every AI employee in every department, the Management story, the use-case graph and the FAQ accordion. [Report](docs/validation/browser-report.md)
- **Simulated users**: **66 / 66 steps** behaved as expected for a desktop trackpad visitor, a phone visitor with swipes and a keyboard-only visitor. One trackpad flick always turns exactly one block, even while the page is busy. [Walkthrough with screenshots](docs/validation/user-walkthrough.md)

Screenshots: [desktop](docs/screenshots/desktop-1440x900), [phone](docs/screenshots/phone-390x844),
contact sheets for all seven viewports in [docs/screenshots/sheets](docs/screenshots/sheets), and
[reduced motion](docs/screenshots/reduced-motion-management.jpg).

## The 17 blocks

| # | Block | What it shows |
|---|---|---|
| 01 | Hero | **NEURONIUM** · “Run AI Business with AI Operating System.” |
| 02 | Shared context · Superagent | A brain-shaped graph whose nodes are the tools — Gmail, Calendar, Meet, Slack, Telegram, WhatsApp, Drive, Docs, Sheets, Apollo, Code, APIs. The AI Superagent starts in the middle and runs along the connections, two ways at once: the connections light up, each tool swells and shows its icon, its name appears and fades. |
| 03 | 100 AI employees | One periodic table: Nr is element 0, the 10 departments are its rows, the 100 AI employees are elements 1–100. The table walks through its departments; hover or pick a department and its row lights up while the left side explains it in a few large lines; hover or pick an element (“44 · Sq”, then “Personalized Sequences”) to see what it does. Search by name, tool or symbol; arrow keys. |
| 04–13 | Departments | Management · HR · Marketing · SMM · Sales · Support · Analytics · Design · Development · Engineering. Each block has its ten AI employees as elements (two rows of five) and **one interface at a time**: every five seconds the next AI employee takes over, its interface comes forward and the part it does lights up. Management is one interface that keeps turning, AI employee by AI employee in order — knowledge, meeting notes, goals, tasks, the board, the Gantt chart, the product, the calendar, the inbox and the team — with the same six tasks moving between the views, from To do to Done. |
| 14 | Use cases | Your own AI employee as a node graph, the way a workflow editor shows it: grey nodes are the system, orange nodes are people, violet nodes are the LLM; data streams violet to orange along the connections, and a person can send work back for changes. It joins the table as element 101 and beyond. Three worked examples. |
| 15 | Pricing | Department (10 AI employees), Company (all 100), Custom (101+). Early access — price on request. |
| 16 | FAQ | Eight questions that open in place — one at a time. |
| 17 | Turn your Idea into Reality | The idea goes straight into the input → “Get Early Access”; “Explore AI Employees”. |

| Department | Headline | Interface pieces |
|---|---|---|
| Management | From goals and tasks to your calendar. | One turning interface: Knowledge · Weekly review · Goals · Product · Tasks · Projects (Gantt) · Calendar · Board · Inbox · Team |
| HR | The skills you need. Grown or hired. | Skills map · Hiring · People |
| Marketing | From a business idea to a product concept. | Market map · Customers · Product concept |
| SMM | Content for every social channel. | Content plan · Studio · Publish and listen |
| Sales | Sales, organized. First contact to purchase. | Offers and audience · Sequence · Conversations · Qualify, book, measure |
| Support | Support on every channel. | Inbox · Ticket · Into the product |
| Analytics | Research, requirements and decisions. | Deep research · Decide · Requirements (PRD · BRD · TRD) |
| Design | From design system to tested prototype. | Prototype · Design system · Flows and pages |
| Development | Code written, tested and reviewed. | Pull request · Codebase · AI and integrations |
| Engineering | Ship safely. Stay up. | Pipeline · Access and security · Health · Recovery and incidents |

## Product truth vs. website demo

- **AI employee data** (`src/data/departments.ts`) carries an `availability` per AI employee:
  `available`, `in-development`, `planned` or `scope`. Everything is `scope` (“Product scope”) until
  confirmed — the table says that availability varies by release. Mark confirmed items there.
- **Illustrative** (labelled “Interface preview · sample data” on screen, not connected to production): every
  piece of interface in the context, department, use-case and FAQ blocks. Company and product names in them
  (Northwind Studio, Brightline) are fictional samples.
- **Pricing** (`src/data/pricing.ts`) describes the intended early-access packages; `price` is `null`, shown as
  “Price on request”, until real prices are set.
- No invented customers, testimonials or metrics. The tools in the context brain are examples of what can be
  connected.

## Code map

```
src/
  App.tsx                         deck assembly, deep links (#sales …), focus & live region
  components/
    SlideController/              one gesture = one block: wheel/trackpad, keys, touch, inner-scroll rules
    LightField/                   continuous WebGL background (shader.ts) + CSS fallback
    ProgressBar/                  bottom violet→orange progress rule
    Nav/                          transparent top menu: Nr logo, sections, Departments dropdown, phone sheet
    Kit/                          interface-piece kit: Panel, Hot (lit section), Sym (mini element), Type, charts
    Element/                      element tile and department colours
    Chrome/                       Nr mark (used as Neuronium's avatar in the FAQ)
  slides/
    Hero/ Context/ Employees/ Custom/ Pricing/ Faq/ Final/
      Context/Brain.tsx           the brain of tools and the Superagent's run through it (SVG + rAF)
    Department/                   one template for all ten departments
      panels/                     the interfaces of each department; management.tsx is one turning scene
  data/
    departments.ts                10 departments × 10 AI employees: symbols, descriptions, headlines, availability
    architecture.ts               OS, AI Governance, AI Agents · AI Workflows · AI Skills
    pricing.ts, faq.ts            plans and questions
    slides.ts                     block order, menu groups and light composition per block
  config/links.ts                 CTA destinations and the idea endpoint
scripts/                          validate-data, validate-browser, simulate-user
```

## Design notes

- **Palette** follows the Nr artwork: electric violet → magenta → pink → orange on `#0B0A0F`; dark only.
  Each department takes its own colour along that gradient.
- **Type**: Geist (display & text) with JetBrains Mono for system labels. The logo is the two letters **Nr**.
  Headlines are sized so their longest line always fits; nothing is cut by the reveal masks.
- **Light field**: two anisotropic potentials (violet, orange) that orbit, rotate and stretch; their overlap
  computes a third light. A clean synthetic gradient with slow film grain; resolution adapts to frame time,
  rendering pauses in hidden tabs and freezes for reduced motion.
- **Motion**: ~820 ms block transitions; headlines rise line by line; interface pieces enter in 3D and follow the
  pointer with a light parallax; the selected AI employee’s panel lifts, the others dim.
- **Navigation**: a trackpad flick with inertia counts as one gesture; while a menu is open the deck stays put.
  Arrow keys inside the periodic table, the department elements and the FAQ stay inside them; PageUp/PageDown
  always move blocks. On phones only the focused piece of interface is shown and the table opens cards on tap.
- **Accessibility**: inactive blocks are `inert`, block changes are announced, all controls are keyboard
  reachable with visible focus, `prefers-reduced-motion` removes motion but keeps a still light overlap.
