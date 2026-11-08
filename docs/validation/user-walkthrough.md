# Simulated user walkthrough

Run: 2026-11-08T15:00:50.720Z · http://127.0.0.1:4173/

**47 / 47 steps behaved as expected.** JavaScript errors: 0.

| # | Visitor | Action | Expectation | Result | Screenshot |
|---|---|---|---|---|---|
| 1 | desktop | Opens the site | NEURONIUM; “Run AI Business with AI Operating System” on one line, the input bar under it; logo is just “Nr” | ✅  | [001-desktop.jpg](walkthrough/001-desktop.jpg) |
| 2 | desktop | Watches the bar on the first block | Example tasks type themselves, then “Try it yourself” | ✅  | [002-desktop.jpg](walkthrough/002-desktop.jpg) |
| 3 | desktop | Writes a task there and presses Enter | The platform opens with it (?task=…) | ✅ https://platform.neuronium.ai/?task=Open%20a%20second%20coffee%20shop | [003-desktop.jpg](walkthrough/003-desktop.jpg) |
| 4 | desktop | Trackpad flick #1 | Exactly one block forward → AI Superagent in your business | ✅ at 2 | [004-desktop.jpg](walkthrough/004-desktop.jpg) |
| 5 | desktop | Trackpad flick #2 | Exactly one block forward → Management | ✅ at 3 | [005-desktop.jpg](walkthrough/005-desktop.jpg) |
| 6 | desktop | Trackpad flick #3 | Exactly one block forward → Cases | ✅ at 4 | [006-desktop.jpg](walkthrough/006-desktop.jpg) |
| 7 | desktop | Trackpad flick #4 | Exactly one block forward → Pricing | ✅ at 5 | [007-desktop.jpg](walkthrough/007-desktop.jpg) |
| 8 | desktop | Trackpad flick #5 | Exactly one block forward → FAQ | ✅ at 6 | [008-desktop.jpg](walkthrough/008-desktop.jpg) |
| 9 | desktop | Trackpad flick #6 | Exactly one block forward → Run your AI business | ✅ at 7 | [009-desktop.jpg](walkthrough/009-desktop.jpg) |
| 10 | desktop | Flicks back up once | Returns to FAQ | ✅  | [010-desktop.jpg](walkthrough/010-desktop.jpg) |
| 11 | desktop | Clicks the Nr logo | Back to the first block | ✅  | [011-desktop.jpg](walkthrough/011-desktop.jpg) |
| 12 | desktop | Looks at the menu | Only the open sections: Platform · Management · Cases · Pricing · FAQ · Contacts | ✅ Platform · Management · Cases · Pricing · FAQ · Contacts | [012-desktop.jpg](walkthrough/012-desktop.jpg) |
| 13 | desktop | Opens Management from the menu | Lands on Management; only its open AI employees are there (1 · Km) | ✅ AI Knowledge Management · menu: Management | [013-desktop.jpg](walkthrough/013-desktop.jpg) |
| 14 | desktop | Watches Knowledge Management (1 · Km) | A question is typed into the search bar at the bottom and answered above it, with the three things it was found in — then the next question | ✅ What did we agree on pilot pricing? → Why is the Cyprus AI market review at risk? | [014-desktop.jpg](walkthrough/014-desktop.jpg) |
| 15 | desktop | Clicks element 1 (Km) | AI Knowledge Management is the title; its element is picked and the line under it counts down to the next answer | ✅ {"hot":false,"title":"AI Knowledge Management","picked":"Knowledge Management","load":1} | [015-desktop.jpg](walkthrough/015-desktop.jpg) |
| 16 | desktop | Clicks “About Knowledge Management” under its line | Its own page opens, a deck like the landing: AI Knowledge Management | ✅ {"h1":"AI Knowledge Management","blocks":6} | [016-desktop.jpg](walkthrough/016-desktop.jpg) |
| 17 | desktop | Turns to the next block there | How it works: a question is typed, understood, searched in the graph and counted, then its report is composed | ✅ Root-cause report — Cyprus AI market review | [017-desktop.jpg](walkthrough/017-desktop.jpg) |
| 18 | desktop | Opens Platform and watches | A command is typed below the brain and sent; the Superagent runs its way and only the tools it needs appear | ✅ {"cmd":"Find new leads and book demos","sent":true,"on":["Sheets","Apollo"],"rest":10,"icons":2,"way":12} | [018-desktop.jpg](walkthrough/018-desktop.jpg) |
| 19 | desktop | Clicks “About Platform” under the title | The platform opens (https://platform.neuronium.ai/) | ✅ https://platform.neuronium.ai/ | [019-desktop.jpg](walkthrough/019-desktop.jpg) |
| 20 | desktop | Opens Cases from the menu | Two rows of pictures with titles flow by, one each way | ✅ Answers with sources, from Drive and Meet \| From today’s calls to the team’s tasks \| From new leads to booked demos \| A Monday review in one report \| Why a goal slips, and what is still open \| What we owe each executor, per currency \| Work in progress, for the daily stand-up \| Who owns what, across the board \| No effect claimed without measurements | [020-desktop.jpg](walkthrough/020-desktop.jpg) |
| 21 | desktop | Points at a case | Its row holds still, the case lifts and says “Soon” (no article yet) | ✅ {"held":"paused","go":"Soon"} | [021-desktop.jpg](walkthrough/021-desktop.jpg) |
| 22 | desktop | Opens “All cases” and searches “leads” | Every case on one page; the search keeps the matching ones | ✅ From new leads to booked demos | [022-desktop.jpg](walkthrough/022-desktop.jpg) |
| 23 | desktop | Opens Pricing | Own model $19 first, then Solo $99 and Team $490 per month on the Medium model, and Scale (Contact us), each with what it includes | ✅ Own model $19/ month \| Solo $99/ month \| Team $490/ month \| Scale Contact us | [023-desktop.jpg](walkthrough/023-desktop.jpg) |
| 24 | desktop | Looks at the buttons | “Start Free Trial” on Own model, Solo and Team leads to the platform with the plan (and level); “Contact sales” on Scale is a button for writing to us | ✅ Start Free Trial → https://platform.neuronium.ai/?plan=own \| Start Free Trial → https://platform.neuronium.ai/?plan=solo&model=m \| Start Free Trial → https://platform.neuronium.ai/?plan=team&model=m \| Contact sales → BUTTON | [024-desktop.jpg](walkthrough/024-desktop.jpg) |
| 25 | desktop | Clicks “Contact sales” on Scale | The “Write to us” card opens in the corner, already about the Scale plan | ✅ {"open":true,"subject":"Scale plan"} | [025-desktop.jpg](walkthrough/025-desktop.jpg) |
| 26 | desktop | Writes their email and a line, presses Send | “Sent. We’ll reply to lena@example.com.” — and the message reached the endpoint | ✅ Sent. We’ll reply to lena@example.com. | [026-desktop.jpg](walkthrough/026-desktop.jpg) |
| 27 | desktop | Picks the High model on Team | The price becomes $990 a month, with 10 000 AI Workforce hours | ✅ $ 990 / month · 10 000 AI Workforce hours | [027-desktop.jpg](walkthrough/027-desktop.jpg) |
| 28 | desktop | Clicks “Start Free Trial” on Team | The platform opens, told the plan and the level | ✅ https://platform.neuronium.ai/?plan=team&model=high | [028-desktop.jpg](walkthrough/028-desktop.jpg) |
| 29 | desktop | Opens “Is it available today?”, then presses ↓ | The answer opens in place and the other one closes (early access); ↓ moves to the next question, not the next block | ✅ Yes, in early access. Ready today: Knowledge Manag · ↓ What does the AI Superagent do? | [029-desktop.jpg](walkthrough/029-desktop.jpg) |
| 30 | desktop | Clicks “Contacts” in the menu | The last block, “Run Your AI Business”, with just the input bar; at its foot: the AIT logo, LinkedIn · X · Instagram · TikTok · YouTube · GitHub, Terms of Use, Privacy Policy | ✅ {"by":"","logo":true,"social":["LinkedIn","X","Instagram","TikTok","YouTube","GitHub"],"legal":["Terms of Use","Privacy Policy"]} | [030-desktop.jpg](walkthrough/030-desktop.jpg) |
| 31 | desktop | Types a business task and presses Enter | The platform opens with the task carried over (?task=…) | ✅ https://platform.neuronium.ai/?task=A%20marketplace%20where%20AI%20agents%20nego | [031-desktop.jpg](walkthrough/031-desktop.jpg) |
| 32 | desktop | Clicks “Open Platform” in the top menu | The platform opens (https://platform.neuronium.ai/) | ✅ https://platform.neuronium.ai/ | [032-desktop.jpg](walkthrough/032-desktop.jpg) |
| 33 | desktop | Looks for a way to the AI employees table | There is none while the table is closed — no dead link | ✅  | [033-desktop.jpg](walkthrough/033-desktop.jpg) |
| 34 | phone | Opens the site on a phone | The tagline still fits on one line | ✅ {"one":true,"right":352.5625,"vw":390} | [034-phone.jpg](walkthrough/034-phone.jpg) |
| 35 | phone | Swipes up to block 2 | AI Superagent in your business within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [035-phone.jpg](walkthrough/035-phone.jpg) |
| 36 | phone | Swipes up to block 3 | Management within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [036-phone.jpg](walkthrough/036-phone.jpg) |
| 37 | phone | Swipes up to block 4 | Cases within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [037-phone.jpg](walkthrough/037-phone.jpg) |
| 38 | phone | Swipes up to block 5 | Pricing within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [038-phone.jpg](walkthrough/038-phone.jpg) |
| 39 | phone | Swipes up to block 6 | FAQ within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [039-phone.jpg](walkthrough/039-phone.jpg) |
| 40 | phone | Swipes up to block 7 | Run your AI business within 3 swipes, no sideways scroll | ✅ 1 swipe(s), inner overflow 0px | [040-phone.jpg](walkthrough/040-phone.jpg) |
| 41 | phone | Opens the menu and taps Management | The sheet closes and the Management block opens | ✅  | [041-phone.jpg](walkthrough/041-phone.jpg) |
| 42 | phone | Taps element 1 (Km) | AI Knowledge Management on its own: the search, what it does, its element — all on one screen | ✅ {"title":"AI Knowledge Management","visible":1,"hot":false,"search":true,"over":0} | [042-phone.jpg](walkthrough/042-phone.jpg) |
| 43 | phone | Types a business task on the phone | Input and button are comfortably reachable | ✅  | [043-phone.jpg](walkthrough/043-phone.jpg) |
| 44 | phone | Taps the message button in the corner | The “Write to us” card opens above it, inside the screen | ✅ {"left":14,"top":339,"right":376,"bottom":776,"vw":390,"vh":844} | [044-phone.jpg](walkthrough/044-phone.jpg) |
| 45 | keyboard | Tabs: skip link → logo → Platform, presses Enter | Opens the shared context block | ✅ Skip to the platform → Neuronium — home → Platform | [045-keyboard.jpg](walkthrough/045-keyboard.jpg) |
| 46 | keyboard | Holds PageDown | Reaches the last block and stops there | ✅  | [046-keyboard.jpg](walkthrough/046-keyboard.jpg) |
| 47 | keyboard | Keeps pressing Tab on the last block | Focus moves through the menu into the visible block; hidden blocks are never focused (inert) | ✅ menu → menu → menu → menu → menu → menu → menu → 6 | [047-keyboard.jpg](walkthrough/047-keyboard.jpg) |

