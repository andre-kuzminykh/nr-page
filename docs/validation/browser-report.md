# Neuronium landing — browser validation

Run: 2026-11-04T03:03:01.789Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**41 / 41 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true} |
| ✅ | Hero: NEURONIUM, then “Run AI Business with AI Operating System.” | Run AI Business with AI Operating System. |
| ✅ | Hero: letters are not clipped by their reveal mask |  |
| ✅ | Hero: NEURONIUM fills its column exactly at 1280, 1920, 2560 and 1440 px wide | 1280:fits · 1920:fits · 2560:fits · 1440:fits |
| ✅ | Top menu: transparent, logo is the two letters Nr (no tile), Platform · AI Employees · Departments · Use cases · Pricing · FAQ, Get Early Access | {"logo":"Nr","logoTile":false,"items":["Platform","AI Employees","Departments","Use cases","Pricing","FAQ"],"cta":"Get Early Access","bg":"rgba(0, 0, 0, 0)","counter":false} |
| ✅ | Menu: jumps to sections; Departments opens all 10; scrolling is ignored while it is open | dropdown: 10 · label: Sales |
| ✅ | Mouse wheel: one notch moves exactly one block |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one block |  |
| ✅ | Background persists across blocks (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 16,0,1,0 |
| ✅ | Shared context: a brain of 12 tools around the AI Superagent; the agent runs along the connections and the tools light up | 7 lit, 24 connections on the way |
| ✅ | Shared context: no extra copy — just the title and the brain | Shared context. One Superagent. AI SUPERAGENT GMAIL CALENDAR |
| ✅ | Periodic table: until someone interacts, it walks through the departments and explains each one | Management → HR |
| ✅ | Periodic table: all 100 AI employees, 10 per department, in order | 100 elements |
| ✅ | Periodic table: unique symbols, Nr is element 0, no column numbers or ranges |  |
| ✅ | Periodic table: no scope notes, no placeholder text, no light sweep over the table |  |
| ✅ | Periodic table: hovering a department or an element explains it on the left — “44 · Sq” above “Personalized Sequences” | Analytics · 44 · Sq / Personalized Sequences |
| ✅ | Periodic table: a department is picked from its row — the row lights up, a card explains it in words (no tiles) and opens the block | {"row":"Marketing","card":"Marketing","words":true,"tiles":0,"pressed":"Marketing"} |
| ✅ | Periodic table: search by tool, empty state | Audience Discovery |
| ✅ | Periodic table: a card opens on the element; arrow keys move through the table | 57 |
| ✅ | Periodic table → department: “Open Sales” opens Sales with Lead Qualification selected | {"i":7,"sel":"Lq"} |
| ✅ | Departments: 10 blocks × 10 AI employees, one interface at a time; each AI employee brings its interface forward and lights up its own part |  |
| ✅ | Management: one interface — the same six tasks turn from a list into a Gantt chart, a calendar and a board | tasks:6 gantt:6 calendar:6 board:6 |
| ✅ | Management board: tasks move on from To do to In progress to Done |  |
| ✅ | Use cases: a custom AI employee as a node graph — grey system, orange human, violet LLM — with data streaming along the connections (element 103) | {"el":"103","nodes":7,"kinds":"fl-n--human,fl-n--llm,fl-n--system","flows":7,"flowing":5} |
| ✅ | Pricing: three plans, prices on request (no invented numbers), no fine print | Price on request \| Price on request \| Price on request |
| ✅ | FAQ: answers open in place, one at a time — opening one closes the others | You do. AI Governance is part of the system: policies, acces |
| ✅ | Final: “Turn your Idea into Reality.”, “Run AI Business with Neuronium.”, idea input with no hint text; empty input is caught; submit hands off honestly | Your email app should open with the idea. If it doesn’t, write to admin@andre.technology. |
| ✅ | Final: “Explore AI Employees” opens the periodic table |  |
| ✅ | Deep link: reload keeps the current block |  |
| ✅ | Touch: swipe up → next block, swipe down → previous block | 1, 0 |
| ✅ | Phone menu: opens full screen, blocks swipes while open, jumps to a section |  |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1920x1080-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1440x900-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1024x768-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 768x1024-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 390x844-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 375x667-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 42 fps (real GPUs run the light field at display refresh rate).

Screenshots: [desktop](../screenshots/desktop-1440x900), [phone](../screenshots/phone-390x844), [contact sheets for all seven viewports](../screenshots/sheets).
