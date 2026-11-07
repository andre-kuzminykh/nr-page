# Neuronium landing — browser validation

Run: 2026-11-07T19:46:02.848Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**35 / 35 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true} |
| ✅ | No gradient bleeds at the edges: every gradient under a border spans that border | none |
| ✅ | Hero: NEURONIUM, then “Run AI Business with AI Operating System.” | Run AI Business with AI Operating System. |
| ✅ | Hero: letters are not clipped by their reveal mask |  |
| ✅ | Hero: NEURONIUM fills its column exactly at 1280, 1920, 2560 and 1440 px wide | 1280:fits · 1920:fits · 2560:fits · 1440:fits |
| ✅ | Top menu: transparent, logo is the two letters Nr (no tile), only the open sections (Platform · Management · Pricing · FAQ · Contacts), Get Early Access to the platform | {"logo":"Nr","logoTile":false,"items":["Platform","Management","Pricing","FAQ","Contacts"],"cta":"Get Early Access","ctaHref":"https://platform.neuronium.ai/","bg":"rgba(0, 0, 0, 0)","counter":false} |
| ✅ | Menu: jumps to sections; with one department open, “Management” links straight to it (no dropdown) | {"active":"Management","dropdown":0} |
| ✅ | Staged release: only the open blocks are on the page (hero · context · management · pricing · faq · start); closed ones are left out and links to them do nothing | 6 blocks · 11 closed · #employees ignored |
| ✅ | Mouse wheel: one notch moves exactly one block |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one block |  |
| ✅ | Background persists across blocks (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 5,0,1,0 |
| ✅ | AI Superagent: a brain of 12 tools that shows none at rest; three commands are typed into the bar below it, each sends the agent its own way and its tools appear on it, and together they reach every tool | Find new leads and book demos: Apollo, Sheets, Gmail, Calendar · Sum up today’s calls for the team: Meet, Docs, Slack, Telegram · Collect feedback and ship the fix: WhatsApp, Drive, Code, APIs · icons at rest: 0 |
| ✅ | AI Superagent: the title “AI Superagent works in your business context”, no extra copy | AI Superagent works in your business context OPEN PLATFORM A |
| ✅ | Departments: 1 open block(s) with only their open AI employees (1); one interface at a time, each AI employee lights up its own part — and one AI employee alone leads its block with its name, what it does and its element | Management: Km |
| ✅ | Management · Knowledge Management (1 · Km) on its own: no window, just the search bar at the bottom — a question is typed and answered above it, with the three things it was found in (an icon and a name each), then the next question | What did we agree on pilot pricing? → Who owns the landing page? · {"sources":3,"plain":true,"cites":0,"answer":80,"frame":0,"lead":0} |
| ✅ | Pricing: Standard $59, Solo $190, Business $890 with Start Free Trial (to the platform), Enterprise “Contact us” with Contact sales (to support) — a name, a price, one line, what it includes and a button, no other copy | Standard $59/ month · Start Free Trial → https://platform.neuronium.ai/ \| Solo $190/ month · Start Free Trial → https://platform.neuronium.ai/ \| Business $890/ month · Start Free Trial → https://platform.neuronium.ai/ \| Enterprise Contact us · Contact sales → mailto:support@neuronium.ai?subject=Neur |
| ✅ | FAQ: answers open in place, one at a time — opening one closes the others | You do. AI Governance is part of the system: policies, acces |
| ✅ | FAQ: answers for today — it names what is ready now — and leaves out questions about closed blocks | 7 questions · Neuronium is in early access. Ready today: Knowledge Management. New AI employees are adde |
| ✅ | Final: “Run Your AI Business”, “with Neuronium” smaller below, “Describe your business task”; Get Early Access opens the platform, and a written task is carried over to it (?task=) | https://platform.neuronium.ai/ · https://platform.neuronium.ai/?task=An%20AI%20concierge%20for%20boutique%20hotels |
| ✅ | Contacts: last in the menu, after FAQ — it opens the final block, whose foot has “Created by” with the orange AIT logo (andre.technology), LinkedIn · X · Instagram · TikTok · YouTube · GitHub (open source), support@neuronium.ai, Terms of Use and Privacy Policy | {"by":"Created by","logo":{"loaded":true,"h":20},"social":["https://www.linkedin.com/in/andre-kuzminykh/","https://x.com/andre_dataist","https://www.instagram.com/andre_dataist","https://www.tiktok.com/@andre_dataist","https://www.youtube.com/@andre_dataist","https://github.com/andre-kuzminykh"],"legal":["mailto:support@neuronium.ai","https://andre.technology/terms/","https://andre.technology/privacy/"]} |
| ✅ | Buttons out: “Open Platform” on the AI Superagent block → https://platform.neuronium.ai/; “Open Knowledge Management” beside the Km element → https://management.neuronium.ai/km | {"platform":{"text":"Open Platform","href":"https://platform.neuronium.ai/","seen":true},"km":{"text":"Open Knowledge Management","href":"https://management.neuronium.ai/km","seen":true}} |
| ✅ | Final: no “Explore AI Employees” link while the periodic table is closed |  |
| ✅ | Deep link: reload keeps the current block (#management) |  |
| ✅ | Touch: swipe up → next block, swipe down → previous block | 1, 0 |
| ✅ | Phone menu: opens full screen, blocks swipes while open, jumps to a section (Contacts) |  |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1920x1080-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1440x900-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1024x768-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 768x1024-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 390x844-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 375x667-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 42 fps (real GPUs run the light field at display refresh rate).

Screenshots: [desktop](../screenshots/desktop-1440x900), [phone](../screenshots/phone-390x844), [contact sheets for all seven viewports](../screenshots/sheets).
