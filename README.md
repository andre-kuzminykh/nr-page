# Neuronium — Run AI Business with AI Operating System

Interactive landing for **Neuronium**, the AI Operating System by Andre AI Technologies (a Dataist AI label).
Full-screen blocks, one gesture per block, over one continuous WebGL light field.
100 ready AI employees are shown as elements of a periodic table; Neuronium is element 0 (**Nr**).

The site opens step by step. **Open now:** the hero, Platform (the AI Superagent in your business context),
Management with its first AI employee (**1 · Km**, Knowledge Management), Cases, Pricing, FAQ and the final
block, which “Contacts” in the menu leads to. The FAQ answers for what is ready today. The other 11 blocks are built and stay hidden
until they are opened — see [Staged release](#staged-release).

**One input bar, on every block that does something.** The hero, the AI Superagent, Knowledge Management and the
last block share the same bar (`src/components/Prompt`). On a block it first shows what it does — example tasks,
commands or questions type themselves and are sent — then says **“Try it yourself”**. The visitor can click into it at
any moment (the demo waits), and what they send opens the product with it. On the last block it is just the input.

**Write to us** is a small button in the bottom-right corner of every block: email, subject and an optional message;
the team replies by email. See [Write to us](#write-to-us).

![Desktop, the open blocks](docs/screenshots/sheets/1440x900.jpg)

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # serve dist/ at http://localhost:4173
```

Requires Node 20.19+ or 22.12+. The build is a static site (`dist/`) and can be hosted anywhere.

### Where the buttons lead

The landing lives on **neuronium.ai**; the product lives on its own subdomains, and the landing only links to them:

| Button | Leads to | Variable |
|---|---|---|
| “Open Platform” in the top menu of both pages, at every screen size (and in the phone menu) | `https://platform.neuronium.ai/` | `VITE_PLATFORM_URL` |
| “Open source”, next to it | `https://github.com/andre-kuzminykh` | `GITHUB_URL` in `links.ts` |
| The bar on the hero and on the AI Superagent block, and the bar on the last block | `https://platform.neuronium.ai/?task=<the task>`; empty on the last block → the platform | `VITE_PLATFORM_URL` |
| “About Platform” under the AI Superagent title | `https://platform.neuronium.ai/` | `VITE_PLATFORM_URL` |
| The bar in Knowledge Management | `https://management.neuronium.ai/km?q=<the question>` | `VITE_KM_URL` |
| “About Knowledge Management” under its line | its own page, `/knowledge-management/` | `VITE_KM_ABOUT_URL` |
| “Open Knowledge Management” at the end of that page | `https://management.neuronium.ai/km` | `VITE_KM_URL` |
| “Start Free Trial” on Own model, Solo and Team | `https://platform.neuronium.ai/?plan=own`, `?plan=<solo|team>&model=<low|medium|high>` | `VITE_PLATFORM_URL` |
| “Contact sales” on Scale | the “Write to us” widget, about the Scale plan (or a sales page, if set) | `VITE_SALES_URL` |
| Terms of Use · Privacy Policy (foot of the last block) | `https://andre.technology/terms/` · `https://andre.technology/privacy/` | `VITE_TERMS_URL` · `VITE_PRIVACY_URL` |

The platform can read `?task=` (and Knowledge Management `?q=`) to start with what the visitor wrote already typed in;
without that, the parameter is simply ignored.
The defaults are in [`src/config/links.ts`](src/config/links.ts); copy `.env.example` to `.env` (or set the variables
in the host's build settings) to point the buttons elsewhere, e.g. at a staging platform.

The foot of the last block (“Contacts” in the menu) holds the orange AIT logo (→ andre.technology), LinkedIn, X,
Instagram, TikTok, YouTube, GitHub, Terms of Use and Privacy Policy. Writing to the team is the widget in the corner.
The social links are the ones published on andre.technology; they are listed once, in `SOCIAL` in `src/config/links.ts`.

## Hosting on neuronium.ai

The site is plain static files. Navigation uses `#block` links (`neuronium.ai/#pricing`), so the host needs
**no rewrite rules**: every address is served by `index.html`. File names under `assets/` carry a content hash,
so they can be cached forever; only `index.html` must stay fresh (Vercel and Cloudflare do this by default).

The domain is registered at **GoDaddy**. The simplest path keeps its DNS there and hosts the site on **Vercel**:
nothing moves away from GoDaddy, and existing records (such as mail for support@neuronium.ai) stay as they are.

**1. Vercel: deploy the site.**
1. vercel.com → Add New → Project → import this GitHub repository. The Vite preset fills in the build command
   (`npm run build`) and the output directory (`dist`); leave them. Deploy.
2. The project → Settings → Domains → add `neuronium.ai`, then `www.neuronium.ai`, and choose to redirect `www` to
   `neuronium.ai`. Vercel shows the DNS records each domain needs; keep that page open.

**2. GoDaddy: point the domain at Vercel.** My Products → Domains → `neuronium.ai` → DNS.
1. If the domain has **Forwarding** set, remove it first; GoDaddy keeps the `@` record locked while forwarding is on.
2. Records for `@`: delete any existing `A` record (often “Parked”) and any `AAAA` record. Then add `A` · name `@` ·
   value from the Vercel domain page (usually `76.76.21.21`).
3. Record for `www`: edit the existing `CNAME www` (GoDaddy points it at `@`) to the value Vercel shows
   (usually `cname.vercel-dns.com`).
4. Leave the `MX`, `TXT` and `NS` records alone: mail and verification depend on them.

The `api/` folder (the “Write to us” function) is deployed with the site; set its key as described in
[Write to us](#write-to-us).

Most changes are live within an hour (up to 48 hours). Vercel issues the HTTPS certificate on its own once the
records match, and the domains turn green on its Domains page. From then on every push to `main` deploys, and
every other branch and pull request gets a preview address.

**Alternative: Cloudflare Pages.** Build command `npm run build`, output `dist`, `NODE_VERSION` = `22`. A root domain
on Cloudflare Pages needs the domain's DNS on Cloudflare: add the site to Cloudflare, check that it copied every
existing record (above all `MX` for mail), then replace the nameservers at GoDaddy (Domain → DNS → Nameservers →
change → enter my own) with the two Cloudflare shows. Then add `neuronium.ai` and `www.neuronium.ai` under the
Pages project's Custom domains, and redirect `www` to the apex with a Redirect Rule.

**The product subdomains.** `platform.neuronium.ai` and `management.neuronium.ai` are separate apps. In the same
GoDaddy DNS add `CNAME platform` and `CNAME management`, each pointing to wherever that app is hosted (its host
shows the value); nothing in this project serves them.

## The AI Knowledge Management page

`/knowledge-management/` is a page of its own (a second Vite entry: `knowledge-management/index.html` → `src/km/`),
written from the feature's description (NR Management · M5). It is a deck like the landing — the same full-screen
blocks, gestures, transitions, light field, menu and progress line (`src/components/Deck`) — with its own blocks
(`src/km/slides.ts`):

1. **AI Knowledge Management** — the name, the line, and the bar (example requests type themselves, then “Try it
   yourself”; a request opens Knowledge Management with it).
2. **Ask a question. Get a report.** — the report sits over its bar, as the landing's search does. The block opens
   on a finished report: a ring grown to the progress against the expected tick, figures that count up, findings with
   their status and citations, limitations, sources. Then the next request types itself into the bar, one thin line
   runs through the four stages (*Understanding the request → Walking the company graph · N records → Calculating →
   Composing the report*), and its report rises — the company report with bars for its goals against plan, a count,
   and a missing module as an honest gap, not a number.
3. **How it works** — one block. A question types itself into the bar; the company graph appears over it (names only:
   no link labels, no legend) and the question walks it record by record; then the graph steps back and the answer
   rises with its figure and sources. *Ask · Search the graph · Count · Answer* light in turn on the left. Two
   questions, then “Try it yourself”.
4. **Access** — “Viewing as” changes the answer.
5. **Use cases** — the landing's Cases block with only Knowledge Management's cases; “All Knowledge Management
   cases” opens every case, filtered by it. 6. **Pricing** — the same block as on the landing. 7. **FAQ** — its own.
   8. **Ask your company** — its own end, with the bar and the foot.

The menu reads Report · How it works · Use cases · Pricing · FAQ · Contacts, with Open source and “Open Platform”
on the right, as on the landing; the logo leads back to the landing. The example reports use the product's demo
workspace (its goals, tasks and people are samples). Static hosts serve the page at `/knowledge-management/` with no
extra rule.

## Write to us

The button in the bottom-right corner opens a small card: **your email**, **subject**, and an optional **message**
(`src/components/Contact`). “Contact sales” on the Scale plan opens it too, with the subject “Scale plan”.
It posts `{ email, subject, message }` to `/api/contact`, and the visitor sees “Sent. We’ll reply to …”.
If sending fails, it says so and offers a plain email to support@neuronium.ai with the subject filled in.
A hidden field catches bots; while the card is open, scrolling does not turn the block, and Escape closes it.

`/api/contact` is [`api/contact.js`](api/contact.js), a Vercel Function that Vercel deploys on its own along with the site.
It sends the message to support@neuronium.ai through [Resend](https://resend.com), with the visitor's address as
Reply-To, so replying to the email answers them. To turn it on:

1. Create a Resend account, add the domain `neuronium.ai`, and add the DNS records Resend shows (SPF and DKIM
   `TXT` records, an `MX` record for its bounce subdomain) in **GoDaddy → DNS**, next to the existing ones.
2. Create an API key in Resend.
3. In Vercel → the project → Settings → Environment Variables, add `RESEND_API_KEY` (and, if needed, `CONTACT_TO`,
   `CONTACT_FROM`; the defaults are support@neuronium.ai and `Neuronium <hello@neuronium.ai>`). Redeploy.

Until the key is set, the function answers 503 and the widget offers the plain email. Another backend can be used
by pointing `VITE_CONTACT_ENDPOINT` at it. `npm run validate:api` checks the function with stand-ins (nothing is sent).

## Staged release

What is open is set in one file, [`src/data/release.ts`](src/data/release.ts):

| Setting | Opens | Now |
|---|---|---|
| `OPEN_EMPLOYEES` | AI employees by number (1–100). A department block opens as soon as one of its AI employees is open and shows only its open elements. | `[1]` — Management with 1 · Km |
| `OPEN_BLOCKS.employees` | The periodic table of 100 AI employees | `false` |
| `OPEN_BLOCKS.custom` | Use cases | `false` |
| `OPEN_BLOCKS.pricing` | Pricing | `true` |
| `OPEN_BLOCKS.faq` | FAQ | `true` |

Until all 100 AI employees are open, the **FAQ** gives the answers for today, for example “Ready today:
Knowledge Management. More arrive one by one.” It leaves out questions about closed blocks,
such as creating your own AI employees, and follows `release.ts` on its own; the full answers
(`src/data/faq.ts`) come back once all 100 are open.

A department with only one open AI employee is led by it. Now that is Management with 1 · Km:
- On the left: the title “AI Knowledge Management”, then “Get answers with the full business context—powered by your
  Corporate World Model.”, then “About Knowledge Management →” (its page on this site), then its element. The line
  under the element fills up until the next answer.
- On the right, no window — just a search bar at the bottom. A question is typed into it and sent, and above it the
  answer comes in word by word with the three things it was found in, each just an icon and a name
  (`src/slides/Department/panels/knowledge.tsx`). The questions are the ones the Knowledge Management page answers:
  pilot pricing (from Drive, Meet and Docs), why a goal is at risk, and what is owed to an executor; then “Try it
  yourself”.
- Once a second AI employee of the department opens, the department's headline, its elements and its turning
  interface come back.

The hero, Platform and the final block are always open. A closed block is not rendered at all:
it is not in the menu, scrolling skips it, and a link to it (`#sales`) does nothing. Links that would
lead to a closed block are hidden too — “Explore AI Employees” on the final block, “Open Sales” in the
table. With one department open, the menu links to it directly; with more, they share the Departments
dropdown.

To open Note Taking (2) next, and then the table:

```ts
export const OPEN_EMPLOYEES: readonly number[] = [1, 2]
export const OPEN_BLOCKS = { employees: true, custom: false, pricing: false, faq: false }
```

The checks read the same file: they test what is open and check that everything else is absent.

## Checks

```bash
npm run validate:data      # 100 AI employees: names, order, numbering, unique element symbols
npm run validate:api       # the contact function, with stand-ins for Vercel and the email provider
npm run validate:browser   # every open block × 7 viewports + functional checks (menu, departments, forms, touch…)
npm run simulate           # simulated visitors: trackpad/desktop, phone with swipes, keyboard only
```

The browser scripts need Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`)
and a running `npm run preview` (override the URL with `BASE_URL=…`). Output goes to `validation/`.

Latest results for the staged release (production build, headless Chromium with software WebGL):

- **Data**: 10 departments × 10 = 100 AI employees (elements 1–100), with exact names, order and unique element symbols.
- **Contact function**: `validate:api` passes — method, missing key, bad input, the bot trap, Reply-To and failures of the email provider.
- **Browser**: **58 / 58 checks passed**, on both pages, at 1920×1080, 1440×900, 1440×760, 1366×657, 1280×800, 1024×768, 768×1024, 390×844, 375×667 and 360×640.
  - No block scrolls inside or is cut (a block too tall for a window is drawn smaller); no horizontal overflow, cut headline lines or truncated panel titles, nothing under the “Write to us” button, no JavaScript errors — on the landing and on the AI Knowledge Management page.
  - The AI Knowledge Management page: its report generator (the report over its bar; it opens on a finished report — ring, figures counted, statuses — then the stages of the next request and its bars against plan), How it works (the graph appears and is walked, then the answer rises over the bar), viewers, its filtered use cases and All cases filtered by it, the shared pricing, its FAQ and its end.
  - Only the open blocks are on the page; the menu shows Platform · Management · Cases · Pricing · FAQ · Contacts, then Open source and Open Platform; links to closed blocks do nothing.
  - The input bar: the hero types its examples, then “Try it yourself”; clicking into the Superagent bar stops its demo and waits for the visitor's task.
  - Cases: two rows flow by, one each way; pointing holds a row; each case is reached once by Tab and says “Soon” until it has a link; All cases opens every case with a search.
  - Write to us: it asks for what is missing, holds the block still, sends to the endpoint, says where the reply goes, offers a plain email when sending fails, and closes on Escape.
  - Knowledge Management answers one question after another, each with its sources and the documents it was found in.
  - Pricing shows Own model, Solo and Team with their model levels (the price, the model, its AI Workforce hours and the trial link follow the level picked) and Scale (Contact us), every button white; the FAQ names what is ready today.
  - Every way out leads where [the table above](#where-the-buttons-lead) says; the last block's task reaches the platform as `?task=`; the foot has the AIT logo, the six socials, support, Terms and Privacy. The platform and Knowledge Management are stand-in pages during the checks, so nothing leaves the machine. [Report](docs/validation/browser-report.md)
- **Simulated users**: **47 / 47 steps** behaved as expected for a desktop trackpad visitor, a phone visitor with swipes and a keyboard-only visitor. One trackpad flick always turns exactly one block, even while the page is busy. The desktop visitor writes a task into the hero's bar, clicks through to the platform and Knowledge Management and comes back, opens Cases (holds a row, searches All cases), and writes to the team from “Contact sales”. [Walkthrough with screenshots](docs/validation/user-walkthrough.md)
- With everything opened in `release.ts`, the same scripts run the full tour of all blocks (last full run: 66 / 66 walkthrough steps).

Screenshots: [desktop](docs/screenshots/desktop-1440x900), [phone](docs/screenshots/phone-390x844), [the AI Knowledge Management page](docs/screenshots/knowledge-management),
contact sheets for all seven viewports in [docs/screenshots/sheets](docs/screenshots/sheets), and
[reduced motion](docs/screenshots/reduced-motion-management.jpg).

## The 18 blocks

Built and in the code; open now: 01, 02, 04 (1 · Km on its own), 15, 16, 17 (for what is ready) and 18.

| # | Block | What it shows |
|---|---|---|
| 01 | Hero | **NEURONIUM** · “Run AI Business with AI Operating System”, and the input bar: example tasks type themselves, then “Try it yourself”. |
| 02 | AI Superagent works in your business context | “About Platform” under the title. A brain-shaped graph whose nodes are the tools — Gmail, Calendar, Meet, Slack, Telegram, WhatsApp, Drive, Docs, Sheets, Apollo, Code, APIs. At rest the brain shows no tools, just its points and connections. Below it a command is typed and sent, and the AI Superagent runs its own way from the core through the tools that command needs — each appears with its icon and name as the agent reaches it, and is gone again as the way fades out. Three commands (“Find new leads and book demos”, “Sum up today’s calls for the team”, “Collect feedback and ship the fix”) take three different ways and together reach all twelve tools; then the bar says “Try it yourself”, and a task written there goes to the platform. The brain is violet through most of its width and turns orange near its right side. |
| 03 | 100 AI employees | One periodic table: Nr is element 0, the 10 departments are its rows, the 100 AI employees are elements 1–100. The table walks through its departments; hover or pick a department and its row lights up while the left side explains it in a few large lines; hover or pick an element (“44 · Sq”, then “Personalized Sequences”) to see what it does. Search by name, tool or symbol; arrow keys. |
| 04–13 | Departments | Management · HR · Marketing · SMM · Sales · Support · Analytics · Design · Development · Engineering. Each block has its ten AI employees as elements (two rows of five) and **one interface at a time**: every five seconds the next AI employee takes over, its interface comes forward and the part it does lights up. Management is one interface that keeps turning, AI employee by AI employee in order — knowledge, meeting notes, goals, tasks, the board, the Gantt chart, the product, the calendar, the inbox and the team — with the same six tasks moving between the views, from To do to Done. |
| 14 | Use cases | Your own AI employee as a node graph, the way a workflow editor shows it: grey nodes are the system, orange nodes are people, violet nodes are the LLM; data streams violet to orange along the connections, and a person can send work back for changes. It joins the table as element 101 and beyond. Three worked examples. |
| 15 | Cases | Built for hundreds of cases. Two rows of cases flow by, one each way — a picture and a title each. Pointing at a row holds it; the case lifts, the others step back. A case with an `href` opens it; until then it says “Soon”. **All cases** opens every case on one page, with a search and its topics to filter by (All · Knowledge Management · AI Superagent). The cases are listed in `src/data/cases.ts`, each with its `topics`: with 12 or more, the two rows share them out; fewer than 3 stand still in one row; a real `image` replaces a drawn picture. |
| 16 | Pricing | **Own model** first — $19 / month, bring your own Provider Key: AI Superagent, AI Management, your AI costs. **Solo**, for a solo builder, and **Team**, up to 10 people in a shared workspace — each at the model level chosen inside the card — Low, Medium and High each with a signal mark and how many times Low's AI Workforce hours it gives (×1, ×1.7, ×3.3): Solo Low $59 · Medium $99 · High $190 with 300 · 500 · 1 000 AI Workforce hours; Team Low $290 · Medium $490 · High $990 with 3 000 · 5 000 · 10 000. The price rolls to the new one, the list ends with its hours (it does not name the model), and “Start Free Trial” tells the platform the plan and level. One AI Workforce hour is about one hour of work by one person: the FAQ says so, and so does the hours line when pointed at. **Scale**, Contact us, more than 10 people — shared workspace, custom AI Workforce; “Contact sales”. Every button is white. |
| 17 | FAQ | Titled just “FAQ”. Questions that open in place — one at a time; none is open at first. Until all 100 are open: the answers for today, without questions about closed blocks. |
| 18 | Run Your AI Business | “Run Your AI Business” on one line, “with Neuronium” smaller below, then just the input bar (“Describe your business task”): sending it opens the platform with the task. At the foot: the orange AIT logo, LinkedIn · X · Instagram · TikTok · YouTube · GitHub, Terms of Use, Privacy Policy. “Contacts”, last in the menu, leads here. |

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
  confirmed. Mark confirmed items there. What is shown on the site is set separately, in `src/data/release.ts`.
- **Illustrative** (labelled “Interface preview · sample data” on screen, not connected to production): every
  piece of interface in the context, department, use-case and FAQ blocks. Company and product names in them
  (Northwind Studio, Brightline) are fictional samples.
- **Pricing** (`src/data/pricing.ts`): Own model $19; Solo — Low $59, Medium $99, High $190; Team — Low $290,
  Medium $490, High $990 (per month), each with a free trial; Scale (more than 10 people) is priced with sales.
  AI Workforce hours as given for High (1 000 Solo, 10 000 Team); the lower levels are set in proportion to their
  price (300 / 500 and 3 000 / 5 000) — change them in `hours` if they differ. Sign-up happens on the platform: “Start Free Trial” leads to
  platform.neuronium.ai, and “Contact sales” opens the “Write to us” widget.
- **Cases** (`src/data/cases.ts`): the articles are being written. Their titles and pictures are on the site; each
  case says “Soon” and links nowhere until it has an `href`. No customer stories are invented.
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
    Prompt/                       the one input bar: its demo (useDemo), “Try it yourself”, the visitor's own text
    Contact/                      “Write to us”, the widget in the bottom-right corner
    Brand/                        brand marks for the social links (Simple Icons, CC0)
    Element/                      element tile and department colours
    Chrome/                       Nr mark (used as Neuronium's avatar in the FAQ)
  slides/
    Hero/ Context/ Employees/ Custom/ Cases/ Pricing/ Faq/ Final/
      Cases/                      flowing rows (CasesSlide), one case (CaseCard), All cases with a search (CasesIndex),
                                  the drawn pictures (Art.tsx) until real images replace them
      Context/Brain.tsx           the brain of tools, the commands and the Superagent's way for each (SVG + rAF)
    Department/                   one template for all ten departments
      panels/                     the interfaces of each department; management.tsx is one turning scene
  data/
    departments.ts                10 departments × 10 AI employees: symbols, descriptions, headlines, availability
    architecture.ts               OS, AI Governance, AI Agents · AI Workflows · AI Skills
    pricing.ts, faq.ts, cases.ts  plans, questions and cases
    slides.ts                     block order, menu groups and light composition per block
    release.ts                    what is open on the site right now (staged release)
    ready.ts                      the open AI employees, for the FAQ
  components/Deck/                the deck itself (blocks, gestures, light, menu) — used by both pages
  km/                             the AI Knowledge Management page: its blocks, content, the live report generator, the graph
  config/links.ts                 where the buttons and bars lead, the social links, the contact endpoint
api/contact.js                    the widget's messages → support@neuronium.ai (Vercel Function, Resend)
scripts/                          validate-data, validate-api, validate-browser, simulate-user
```

## Design notes

- **Palette** follows the Nr artwork: electric violet → magenta → pink → orange on `#0B0A0F`; dark only.
  Each department takes its own colour along that gradient.
- **Type**: Geist (display & text) with JetBrains Mono for system labels. The logo is the two letters **Nr**.
  Headlines are sized so their longest line always fits; nothing is cut by the reveal masks.
- **Light field**: two anisotropic potentials (violet, orange) that orbit, rotate and stretch; their overlap
  computes a third light. A clean synthetic gradient with slow film grain; resolution adapts to frame time,
  rendering pauses in hidden tabs and freezes for reduced motion.
- **Motion**: the leaving block fades in ~0.3 s and the arriving one settles in ~0.7 s, with no full-screen blur;
  headlines rise line by line; the hero's letters rise straight up and one light passes over them once; interface
  pieces enter in 3D and follow the pointer with a light parallax; the selected AI employee’s panel lifts, the others
  dim. Only opacity and transform are animated in loops (the “Try it yourself” glow is a separate layer).
- **Navigation**: a trackpad flick with inertia counts as one gesture; while a menu is open the deck stays put.
  Arrow keys inside the periodic table, the department elements and the FAQ stay inside them; PageUp/PageDown
  always move blocks. On phones only the focused piece of interface is shown and the table opens cards on tap.
- **Accessibility**: inactive blocks are `inert`, block changes are announced, all controls are keyboard
  reachable with visible focus, `prefers-reduced-motion` removes motion but keeps a still light overlap.
