# Tsoro — Task Tracker

Operational checklist. Strategic plan lives in [PLAN.md](./PLAN.md).

**Legend:** ✅ done · ⏳ in progress · 👷 queued

---

## 🔖 Session handoff

**Where we left off (2026-06-21):**
1. **Clockwise sowing fix** — `engine.js` had been updated to clockwise paths (P1 outer right→left, inner left→right) but the Netlify deploy was stale. Redeployed with the correct engine.
2. **End-game overlay** — modal appears after final animation: winner name, "Play again" button. "New game" also dismisses it.
3. **Responsive layout** — added `<meta viewport>`, tightened padding/font sizes in `@media (max-width: 480px)`, hid the examples bar label on small screens.
4. **Undo** — history stack (human moves only); Undo button greyed when empty or animating; cleared on new game / scenario load.
5. **AI opponent** — new `ai.js` module; mode selector (2-Player | Easy AI | Medium AI | Hard AI); AI always plays P2; "You/AI" labels in AI modes; "AI thinking…" banner during delay; Easy=random, Medium=greedy depth-1, Hard=minimax+alpha-beta depth-5. Tested Easy — works well.
6. Deployed all of the above to Netlify.

**How to resume:**
- Project lives at `/Users/linnet/Documents/tsoro`.
- No Node.js installed. Serve with `python3 -m http.server 8765`; play at `/play-svg.html`, tests at `/test.html`, barebones reference at `/play.html`.
- Check `lsof -i :8765` before starting the server — a previous session's server may still be running.
- Redeploy: `zip -j /tmp/tsoro-deploy.zip index.html play-svg.html play.html engine.js ai.js engine.test.js test.html game.html play-animated.html demo-anim.html` then curl POST to Netlify API (site ID `31191621-2b5a-4d02-b9d2-bd411c974fa6`, token stored separately).

**Top of the queue:** Phase 2 remainders (distinct relay/capture visuals, sound, themes) or Phase 5 cultural content.

---

## Phase 0 — Decisions ✅

- ✅ Pick variant: 4-row Tsoro (Shona mancala, 4×7 board)
- ✅ Tech stack: plain HTML / CSS / JS (no framework, no build step)
- ✅ Canonical rules source: Wikipedia *Tsoro* + Mancala World
- ✅ Sub-decisions locked: starting seeds = 2/hole; sowing path conventions; no-legal-moves → current player loses

## Phase 1 — Game engine ✅

- ✅ Board representation (28 pits indexed 0–27)
- ✅ Sowing path definitions (P1 + P2 closed 14-pit loops)
- ✅ Column mapping for captures (`opposingColumn`)
- ✅ Legal-move generation (pits with ≥2 seeds)
- ✅ Sowing + relay logic (last-in-non-empty-outer → continue)
- ✅ Capture + capture-chain logic (last-in-inner-with-opp-seeds → grab opp column, continue)
- ✅ End-of-game detection (opp zero seeds OR opp no legal moves)
- ✅ Move validation + error handling
- ✅ Test suite — 17 tests, all passing
- ✅ Browser test runner (`test.html`)
- ✅ Barebones playable console (`play.html`) — pass-and-play works for free
- ✅ Landing page (`index.html`)

## Deployment ✅

- ✅ Local dev server (Python `http.server`, port 8765)
- ✅ Netlify deploy — https://frabjous-axolotl-99ed9c.netlify.app (site ID `31191621-2b5a-4d02-b9d2-bd411c974fa6`)
- ✅ Deployed URL recorded here; redeploy via curl zip-upload to Netlify API (no CLI needed)
- 👷 GitHub repo + auto-deploy (Phase 6 territory)

## Phase 1.5 — Proper minimal UI ✅

Shipped in `play-svg.html`. Original `play.html` left untouched as a reference.

- ✅ SVG board rendering — warm wooden board, carved pits, ivory seeds as small ellipses
- ✅ Turn/phase indicator — colour-coded banner + active-row glow band
- ✅ Legal-pit highlighting — gold ring on clickable pits
- ✅ Worked-example scenarios — Sowing / Capture / Relay buttons (beyond original scope, added per user feedback)
- ✅ Seed arc animation — on click, all seeds in the pit launch simultaneously (70 ms stagger, 560 ms arc each); board updates as each seed lands; relay/capture chains handled with inter-batch pauses
- ~~Hover preview (ghost seeds, capture rings)~~ — removed per user preference; single animation is the only feedback
- ~~Capture/landing CSS flash animations~~ — removed; capture is communicated via the move log and the brief board pause between batches

## Phase 2 — Polish 👷

- ✅ Seed-sowing animation — batch arc flight (all seeds from source simultaneously, staggered); relay and capture chains animate continuously
- ✅ Responsive layout — viewport meta tag, mobile media query (≤480px), examples label hidden on small screens
- ✅ Undo — history stack (human moves only); button greyed when empty/animating; cleared on reset/scenario
- ✅ End-game screen — overlay modal with winner name and "Play again" button
- 👷 Distinct visuals/sound for relay vs capture
- 👷 Sound effects
- 👷 Themes / color palette
- 👷 Move history panel

## Phase 3 — AI opponent ✅

- ✅ Baseline: random legal move (Easy)
- ✅ Greedy: maximize captures this turn (Medium)
- ✅ Minimax with alpha-beta pruning, depth 5 (Hard)
- ✅ Difficulty levels in UI — mode selector pill row (2-Player | Easy AI | Medium AI | Hard AI)
- 👷 MCTS (optional — revisit if Hard minimax proves too weak)

## Phase 4 — Multiplayer 👷

- ✅ Local pass-and-play (working in `play.html`)
- 👷 Online multiplayer: lobby, real-time sync, accounts (big lift)

## Phase 5 — Cultural / educational 👷

- 👷 History & rules page with attribution to Shona origin
- 👷 Tutorial mode (guided first few turns)
- 👷 Variant selector — add Tsoro Yematatu as sibling
- 👷 Credits & cultural sources

## Phase 6 — Ship 👷

- 👷 Permanent static host (Netlify, Vercel, GitHub Pages)
- 👷 Custom domain (optional)
- 👷 Mobile wrap via Capacitor / Tauri (optional)

---

## Known open questions / decisions to revisit

- Starting seeds = 2 was a sources-disagreement call; revisit if early playtesting feels off (some sources suggest 3).
- Currently no "draw by agreement" mechanism — sources mention this exists in real play.
