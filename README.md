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
npm run validate:browser   # 17 blocks × 6 viewports + functional checks (menu, table, departments, forms, touch…)
npm run simulate           # simulated visitors: trackpad/desktop, phone with swipes, keyboard only
```

The browser scripts need Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`)
and a running `npm run preview` (override the URL with `BASE_URL=…`). Output goes to `validation/`.

Latest results (production build, headless Chromium with software WebGL):

<!-- results -->

Screenshots: [desktop](docs/screenshots/desktop-1440x900), [phone](docs/screenshots/phone-390x844),
contact sheets for every viewport in [docs/screenshots/sheets](docs/screenshots/sheets), and
[reduced motion](docs/screenshots/reduced-motion-management.jpg).

## The 17 blocks

| # | Block | What it shows |
|---|---|---|
| 01 | Hero | **NEURONIUM** · “Run AI Business with AI Operating System.” |
| 02 | Shared context · Superagent | Files, calendars, conversations and tools (examples, connected through MCP and integrations) become one business context — AI Identity and the AI Knowledge Graph. The AI Superagent plans the work across AI employees; AI Governance (Policy · Access · Oversight · Control) keeps outgoing emails waiting for approval. |
| 03 | 100 AI employees | One periodic table: Nr is element 0, the 10 departments are its rows, the 100 AI employees are elements 1–100. Search (by name, tool or symbol), arrow keys, a short tour, a card with “Open *department*”. |
| 04–13 | Departments | Management · HR · Marketing · SMM · Sales · Support · Analytics · Design · Development · Engineering. Each block shows its ten AI employees as elements next to 3–4 pieces of interface. The selected AI employee brings its panel forward and lights up exactly the part of the interface it does; the block plays through all ten until you pick one. |
| 14 | Use cases | Your own AI employee from AI Agents, AI Workflows and AI Skills on the shared context, with AI Governance on every step. It joins the table as element 101 and beyond. Three worked examples. |
| 15 | Pricing | Department (10 AI employees), Company (all 100), Custom (101+). Early access — price on request. |
| 16 | FAQ | Eight questions, answered as a conversation with Neuronium. |
| 17 | Turn your Idea into Reality | The idea goes straight into the input → “Get Early Access”; “Explore AI Employees”. |

| Department | Headline | Interface pieces |
|---|---|---|
| Management | From goals and tasks to your calendar. | Weekly review (Google Meet notes) · Goals and tasks · Board and timeline · Calendar, inbox and team |
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
- No invented customers, testimonials or metrics. Tools are named as examples of integrations, with
  “availability varies”.

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
    Department/                   one template for all ten departments
      panels/                     the interface pieces of each department (management.tsx … engineering.tsx)
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
