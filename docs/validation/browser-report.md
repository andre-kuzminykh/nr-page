# Neuronium landing — browser validation

Run: 2026-10-27T20:44:09.153Z · http://127.0.0.1:4173/ · Chromium (headless, software WebGL)

**36 / 36 checks passed.**

| | Check | Detail |
|---|---|---|
| ✅ | Continuous light background renders with WebGL (single persistent canvas) | {"canvas":true,"ready":true,"fallback":false} |
| ✅ | Mouse wheel: one notch moves exactly one slide |  |
| ✅ | Trackpad inertia: one long gesture moves exactly one slide |  |
| ✅ | Background persists across slides (canvas not re-created) |  |
| ✅ | Keyboard: End / Home / ArrowDown / ArrowUp | 11,0,1,0 |
| ✅ | Hero CTA "Explore Neuronium" opens the architecture |  |
| ✅ | Architecture: AI Governance (Policy, Access, Oversight, Control) is inside the Neuronium block |  |
| ✅ | Architecture: AI Business = AI Identity | AI Knowledge Graph | AI Superagent |  |
| ✅ | Architecture: AI-Native is above AI-First |  |
| ✅ | Architecture: AI-First grid is 2×5 in the approved order (Management first tile) | [["Management","HR","Marketing","SMM","Sales"],["Support","Analytics","Design","Development","Engineering"]] |
| ✅ | Architecture: one slim line AI Agents · AI Workflows · AI Skills |  |
| ✅ | AI Employees: 10 tiles in order, Management selected by default |  |
| ✅ | AI Employees: click and arrow keys change the responsibility panel | after ArrowRight: Marketing |
| ✅ | AI Employees: arrow keys inside the grid do not change the slide |  |
| ✅ | Catalog: periodic table holds all 100 elements, 10 per AI Employee, in order | 100 elements |
| ✅ | Catalog: every element has a unique symbol; Nr is element 0 |  |
| ✅ | Catalog search: finds by tool name, shows an empty state, searches across categories | apollo→Audience Discovery; "management"→14 |
| ✅ | Catalog: arrow keys move through the table and update the detail | Competitor Analysis |
| ✅ | Catalog: choosing a category selects its first element |  |
| ✅ | Configuration: AI-Native hides the 10-employee grid |  |
| ✅ | Configuration: AI-First composes employees into live JSON |  |
| ✅ | Inner scroll: the JSON preview scrolls without changing the slide | scrollTop 855 |
| ✅ | "Get Early Access" links point to a real destination (no fake sign-up) | mailto:admin@andre.technology?subject=Neuronium%20Early%20Access |
| ✅ | Final slide: "Turn your Idea into Reality" with an idea input; empty input is caught; submit hands off honestly | Your email app should open with the idea. If it doesn’t, write to admin@andre.technology. |
| ✅ | Final CTA "Explore Capabilities" opens the catalog |  |
| ✅ | Top bar: transparent, Nr logo only (no slide counter, no theme switch) | {"topbarChildren":1,"logo":true,"counter":false,"bg":"rgba(0, 0, 0, 0)"} |
| ✅ | Deep link: reload keeps the current slide |  |
| ✅ | Touch: swipe up → next slide, swipe down → previous slide | 1, 0 |
| ✅ | Reduced motion: content is fully visible without motion; background stays as a still overlap |  |
| ✅ | Layout 1440x900-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | all slides fit without inner scroll |
| ✅ | Layout 1280x800-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | inner scroll used on slide(s) 10 |
| ✅ | Layout 1024x768-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | inner scroll used on slide(s) 9 |
| ✅ | Layout 768x1024-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | inner scroll used on slide(s) 10 |
| ✅ | Layout 390x844-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | inner scroll used on slide(s) 9, 11 |
| ✅ | Layout 375x667-dark: 12 slides reached by keyboard, no horizontal overflow, progress in sync | inner scroll used on slide(s) 9 |
| ✅ | No JavaScript errors in any run |  |

Indicative frame rate in headless software rendering: 39 fps (real GPUs run the light field at display refresh rate).

Screenshots: `validation/screenshots/<viewport>-<theme>/NN-<slide>.jpg`.
