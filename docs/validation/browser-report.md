# Neuronium landing — browser validation

Run: 2026-11-06T14:27:57.370Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**29 / 29 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true} |
| ✅ | Hero: NEURONIUM, then “Run AI Business with AI Operating System.” | Run AI Business with AI Operating System. |
| ✅ | Hero: letters are not clipped by their reveal mask |  |
| ✅ | Hero: NEURONIUM fills its column exactly at 1280, 1920, 2560 and 1440 px wide | 1280:fits · 1920:fits · 2560:fits · 1440:fits |
| ✅ | Top menu: transparent, logo is the two letters Nr (no tile), only the open sections (Platform · Management), Get Early Access | {"logo":"Nr","logoTile":false,"items":["Platform","Management"],"cta":"Get Early Access","bg":"rgba(0, 0, 0, 0)","counter":false} |
| ✅ | Menu: jumps to sections; with one department open, “Management” links straight to it (no dropdown) | {"active":"Management","dropdown":0} |
| ✅ | Staged release: only the open blocks are on the page (hero · context · management · start); closed ones are left out and links to them do nothing | 4 blocks · 13 closed · #employees ignored |
| ✅ | Mouse wheel: one notch moves exactly one block |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one block |  |
| ✅ | Background persists across blocks (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 3,0,1,0 |
| ✅ | Shared context: a brain of 12 tools around the AI Superagent; the agent runs along the connections and the tools light up | 7 lit, 28 connections on the way |
| ✅ | Shared context: no extra copy — just the title and the brain | Shared context. One Superagent. AI SUPERAGENT GMAIL CALENDAR |
| ✅ | Departments: 1 open block(s) with only their open AI employees (1), one interface at a time; each AI employee brings its interface forward and lights up its own part | Management: Km |
| ✅ | Management · Knowledge Management (1 · Km): asks and answers one question after another, each answer with its sources and the documents it was found in | 1 AI employee · What did we agree on pilot pricing? → Who owns the landing page? |
| ✅ | Final: “Turn your Idea into Reality.”, “Run AI Business with Neuronium.”, idea input with no hint text; empty input is caught; submit hands off honestly | Your email app should open with the idea. If it doesn’t, write to admin@andre.technology. |
| ✅ | Final: no “Explore AI Employees” link while the periodic table is closed |  |
| ✅ | Deep link: reload keeps the current block (#management) |  |
| ✅ | Touch: swipe up → next block, swipe down → previous block | 1, 0 |
| ✅ | Phone menu: opens full screen, blocks swipes while open, jumps to a section (Management) |  |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1920x1080-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1440x900-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1024x768-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 768x1024-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 390x844-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 375x667-dark: 4 blocks reached by keyboard, no horizontal overflow, no cut headlines or panel titles, progress in sync | all slides fit without inner scroll |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 39 fps (real GPUs run the light field at display refresh rate).

Screenshots: [desktop](../screenshots/desktop-1440x900), [phone](../screenshots/phone-390x844), [contact sheets for all seven viewports](../screenshots/sheets).
