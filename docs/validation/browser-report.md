# Neuronium landing — browser validation

Run: 2026-11-07T14:39:33.682Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**32 / 32 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true} |
| ✅ | Hero: NEURONIUM, then “Run AI Business with AI Operating System.” | Run AI Business with AI Operating System. |
| ✅ | Hero: letters are not clipped by their reveal mask |  |
| ✅ | Hero: NEURONIUM fills its column exactly at 1280, 1920, 2560 and 1440 px wide | 1280:fits · 1920:fits · 2560:fits · 1440:fits |
| ✅ | Top menu: transparent, logo is the two letters Nr (no tile), only the open sections (Platform · Management · Pricing · FAQ), Get Early Access | {"logo":"Nr","logoTile":false,"items":["Platform","Management","Pricing","FAQ"],"cta":"Get Early Access","bg":"rgba(0, 0, 0, 0)","counter":false} |
| ✅ | Menu: jumps to sections; with one department open, “Management” links straight to it (no dropdown) | {"active":"Management","dropdown":0} |
| ✅ | Staged release: only the open blocks are on the page (hero · context · management · pricing · faq · start); closed ones are left out and links to them do nothing | 6 blocks · 11 closed · #employees ignored |
| ✅ | Mouse wheel: one notch moves exactly one block |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one block |  |
| ✅ | Background persists across blocks (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 5,0,1,0 |
| ✅ | AI Superagent: a brain of 12 tools that shows none at rest; three commands are typed into the bar below it, each sends the agent its own way and its tools appear on it, and together they reach every tool | Find new leads and book demos: Apollo, Sheets, Gmail, Calendar · Sum up today’s calls for the team: Meet, Docs, Slack, Telegram · Collect feedback and ship the fix: WhatsApp, Drive, Code, APIs · icons at rest: 0 |
| ✅ | AI Superagent: the title “AI Superagent works in the context of your business”, no extra copy | AI Superagent works in the context of your business AI SUPER |
| ✅ | Departments: 1 open block(s) with only their open AI employees (1); one interface at a time, each AI employee lights up its own part — and one AI employee alone leads its block with its name, what it does and its element | Management: Km |
| ✅ | Management · Knowledge Management (1 · Km) on its own: no window, just the search bar at the bottom — a question is typed and answered above it, with the three things it was found in (an icon and a name each), then the next question | What did we agree on pilot pricing? → Who owns the landing page? · {"sources":3,"plain":true,"cites":0,"answer":80,"frame":0,"lead":0} |
| ✅ | Pricing: Standard $59, Solo $190, Business $890 with Start Free Trial, Enterprise “Contact us” with Contact sales — a name, a price, one line, what it includes and a button, no other copy | Standard $59/ month · Start Free Trial \| Solo $190/ month · Start Free Trial \| Business $890/ month · Start Free Trial \| Enterprise Contact us · Contact sales |
| ✅ | FAQ: answers open in place, one at a time — opening one closes the others | You do. AI Governance is part of the system: policies, acces |
| ✅ | FAQ: answers for today — it names what is ready now — and leaves out questions about closed blocks | 7 questions · Neuronium is in early access. Ready today: Knowledge Management. New AI employees are adde |
| ✅ | Final: “Run Your AI Business”, “with Neuronium” smaller below, idea input with no hint text; empty input is caught; submit hands off honestly | Your email app should open with the idea. If it doesn’t, write to admin@andre.technology. |
| ✅ | Final: no “Explore AI Employees” link while the periodic table is closed |  |
| ✅ | Deep link: reload keeps the current block (#management) |  |
| ✅ | Touch: swipe up → next block, swipe down → previous block | 1, 0 |
| ✅ | Phone menu: opens full screen, blocks swipes while open, jumps to a section (FAQ) |  |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1920x1080-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1440x900-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1024x768-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 768x1024-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 390x844-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 375x667-dark: 6 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 41 fps (real GPUs run the light field at display refresh rate).

Screenshots: [desktop](../screenshots/desktop-1440x900), [phone](../screenshots/phone-390x844), [contact sheets for all seven viewports](../screenshots/sheets).
