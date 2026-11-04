# Neuronium landing — browser validation

Run: 2026-11-04T00:49:05.717Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**32 / 32 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true} |
| ✅ | Hero: NEURONIUM, then “Run AI Business with AI Operating System.” | Run AI Business with AI Operating System. |
| ✅ | Hero: letters are not clipped by their reveal mask |  |
| ✅ | Top menu: transparent, logo is the two letters Nr (no tile), Platform · AI Employees · Departments · Use cases · Pricing · FAQ, Get Early Access | {"logo":"Nr","logoTile":false,"items":["Platform","AI Employees","Departments","Use cases","Pricing","FAQ"],"cta":"Get Early Access","bg":"rgba(0, 0, 0, 0)","counter":false} |
| ✅ | Menu: jumps to sections; Departments opens all 10; scrolling is ignored while it is open | dropdown: 10 · label: Sales |
| ✅ | Mouse wheel: one notch moves exactly one block |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one block |  |
| ✅ | Background persists across blocks (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 16,0,1,0 |
| ✅ | Shared context: 12 source icons, Superagent plan across AI employees, AI Governance (Policy · Access · Oversight · Control) | {"sources":12,"steps":6,"running":2} |
| ✅ | Periodic table: all 100 AI employees, 10 per department, in order | 100 elements |
| ✅ | Periodic table: unique symbols, Nr is element 0, no column numbers or ranges |  |
| ✅ | Periodic table: search by tool, empty state | Audience Discovery |
| ✅ | Periodic table: a card opens on the element; arrow keys move through the table | 57 |
| ✅ | Periodic table → department: “Open Sales” opens Sales with Lead Qualification selected | {"i":7,"sel":"Lq"} |
| ✅ | Departments: 10 blocks × 10 AI employees; each one focuses a panel and lights up its own part of the interface |  |
| ✅ | Use cases: examples switch; a custom AI employee continues the table (element 103) | {"el":"103","gov":"Policy no outside messages without approvalAccess Read: documents · Write: tasksOversight approval stepControl pause · version history"} |
| ✅ | Pricing: three plans, prices on request (no invented numbers) | Price on request \| Price on request \| Price on request |
| ✅ | FAQ: questions answer as Neuronium | You do. AI Governance is part of the system: policies, acces |
| ✅ | Final: “Turn your Idea into Reality.”, no extra logo, idea input; empty input is caught; submit hands off honestly | Your email app should open with the idea. If it doesn’t, write to admin@andre.technology. |
| ✅ | Final: “Explore AI Employees” opens the periodic table |  |
| ✅ | Deep link: reload keeps the current block |  |
| ✅ | Touch: swipe up → next block, swipe down → previous block | 1, 0 |
| ✅ | Phone menu: opens full screen, blocks swipes while open, jumps to a section |  |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1440x900-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1024x768-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 768x1024-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 390x844-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 375x667-dark: 17 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 40 fps (real GPUs run the light field at display refresh rate).

Screenshots: [desktop](../screenshots/desktop-1440x900), [phone](../screenshots/phone-390x844), [contact sheets for all six viewports](../screenshots/sheets).
