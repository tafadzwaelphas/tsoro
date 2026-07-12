# Tsoro — Task Tracker

Operational checklist. Strategic plan lives in [PLAN.md](./PLAN.md).

**Legend:** ✅ done · ⏳ in progress · 👷 queued

---

## 🔖 Session handoff

**Where we left off (2026-07-05):**
1. **Clockwise sowing fix** — `engine.js` had been updated to clockwise paths (P1 outer right→left, inner left→right) but the Netlify deploy was stale. Redeployed with the correct engine.
2. **End-game overlay** — modal appears after final animation: winner name, "Play again" button. "New game" also dismisses it.
3. **Responsive layout** — added `<meta viewport>`, tightened padding/font sizes in `@media (max-width: 480px)`, hid the examples bar label on small screens.
4. **Undo** — history stack (human moves only); Undo button greyed when empty or animating; cleared on new game / scenario load.
5. **AI opponent** — new `ai.js` module; mode selector (2-Player | Easy AI | Medium AI | Hard AI); AI always plays P2; "You/AI" labels in AI modes; "AI thinking…" banner during delay; Easy=random, Medium=greedy depth-1, Hard=minimax+alpha-beta depth-5. Tested Easy — works well.
6. Deployed all of the above to Netlify.
7. **Distinct relay/capture visuals + sound** — pit pulses gold (relay) or red (capture) via CSS `pulse-relay`/`pulse-capture` classes while the board pauses; each also plays a synthesized Web Audio cue (no asset files: rising two-note chime for relay, low thud + bright ring for capture).
8. **Fixed stale worked-example scenarios** — the ▶ Sowing / ▶ Capture / ▶ Relay demo buttons' pit setups predated the clockwise sowing fix (item 1) and no longer produced the events they claimed (e.g. ▶ Capture triggered a plain turn-end, ▶ Sowing accidentally triggered a capture and instant win). Recomputed correct pit values by tracing `engine.js`'s actual `SOWING_PATH`; verified all three with a scripted Playwright run.
9. **General sound effects** — seed-landing tick, quiet turn-end tone, win flourish, UI click sounds; mute toggle (🔊/🔇) persisted via `localStorage` key `tsoro-muted`.
10. **Themes** — Wood/Midnight/Savanna/Charcoal, driven entirely by CSS custom properties (including the SVG board gradients via `var()` in `stop-color`/`stroke`); pill selector; persisted via `localStorage` key `tsoro-theme`.
11. **Move history panel** — compact numbered list above the detailed log; click a row to scroll its log entry into view (event-delegated so it survives undo/reset innerHTML swaps); synced with undo/reset/scenario state.
12. **Naming fix + History & Rules page** — this game had been mislabeled "Tsoro Yematatu" since the first commit; that name actually belongs to a *different* Shona game (a 3-piece triangular alignment game, confirmed via Wikipedia). Corrected README to plain "Tsoro". Added `history.html` (linked from `index.html` and the play page footer) covering meaning, cultural history, rules, and cited sources (Wikipedia's Tsoro + Tsoro Yematatu articles; `mancala.fandom.com` returned HTTP 402 this session and couldn't be re-verified, so it's credited generically per earlier research rather than quoted).
13. **Tutorial mode** — "🎓 Guided tutorial" button (in the examples row) runs a 5-step walkthrough (intro → sowing → capture → relay → outro), each move step on its own curated board; Next/Exit controls; Undo disabled during tutorial; any of New game/scenario/mode/theme buttons cleanly exits it.
14. **Fixed a real race-condition bug**: a user reported the hint box showing literal text "undefined" alongside a corrupted board/history after starting the tutorial while an AI turn was in flight. Root cause: a stale `runAI()`/`executeMove()`/`animateMove()` promise chain from a prior game could resume *after* a reset (New game / scenario / tutorial step) had already replaced `state`, and go on to mutate the new state — in the reported case, landing on `TUTORIAL_STEPS[tutorialIndex].after` where that step had no `.after` field (it was the intro step), producing "undefined". Fixed with an `epoch` counter bumped by `resetBoardState()`; `animateMove`, `animateBatch`, `executeMove`, and `runAI` all capture the epoch at start and check it after every `await`, abandoning themselves silently if a reset happened in the meantime. This closes the same class of bug for New game and the scenario buttons too, not just tutorial. Verified via scripted Playwright runs (full tutorial flow, relay/capture pulses, move history, and a repeated-click stress test around the vulnerable window) — all clean, zero console errors.
15. **Changed default mode to Easy AI** — 2-Player is likely the less common experience; new page loads now default to Easy AI (mode pill + `aiMode` initial value), verified a fresh load shows "You to move" and the AI replies correctly.
16. **Fixed a second real bug surfaced by the Easy-AI-default change**: with 2-Player no longer the default, the ▶ Sowing/Capture/Relay worked-example buttons started triggering an AI response afterward too (since they never bypassed the `aiMode !== '2p' && state.turn === P2` check the way tutorial does) — found via a regression test that started timing out. Added an `inScenario` flag (set by `loadScenario()`, cleared by `resetToDefault()`/`showTutorialStep()`) that suppresses the AI turn for worked-example demos, mirroring how `tutorialIndex` already does this for tutorial steps.
17. Checked the live deployed site directly (not just localhost) — confirmed pages return 200, default mode is Easy AI, tutorial/history/relay/capture all work correctly end-to-end via scripted Playwright runs. Investigated an apparent "stuck/corrupted state" pattern seen in ad-hoc polling tests; traced it with temporary instrumentation (added and then removed — no diff left behind) and confirmed it was a harmless ~1ms turn-handoff render plus long capture/relay chain animation durations (several seconds is normal for 8+ seed captures), not a real bug.
18. All of items 7–17 deployed to Netlify; this is fully current as of this handoff.

**How to resume:**
- Project lives at `/Users/linnet/Documents/tsoro`.
- Node.js is now installed (`v24.16.0`, plus `npx playwright` for browser-driven verification) — earlier notes saying otherwise are stale.
- Serve with `python3 -m http.server 8765`; play at `/play-svg.html`, tests at `/test.html`, barebones reference at `/play.html`, history/rules at `/history.html`.
- Check `lsof -i :8765` before starting the server — a previous session's server may still be running.
- **Live site (2026-07-12 onward): GitHub Pages — https://tafadzwaelphas.github.io/tsoro/** — auto-deploys from `main` on every push, no build step, no billing account. Just `git push`; GitHub rebuilds Pages within ~30-60s.
- ~~Netlify deploy~~ — abandoned 2026-07-12: the free-tier account got blocked with "Account credit usage exceeded — new deploys are blocked until credits are added" despite 0/300 credits used and no clear cause; no card on file and switching hosts was simpler than debugging Netlify billing. Old manual redeploy recipe (zip + curl POST to Netlify API, site ID `31191621-2b5a-4d02-b9d2-bd411c974fa6`) is obsolete; token if still present in `.claude/settings.local.json` permission-allowlist entries can be ignored/removed.

19. **Chess.com-style tutorial redesign** (2026-07-12): replaced the plain shared `#hint` text the tutorial used to reuse with a dedicated coach panel — avatar badge + speech-bubble card (`#tutorial-panel`), progress dots (`#tutorial-dots`, replacing the old "Step X of Y" text), a bouncing 👆 callout drawn in the SVG over the exact pit to click (new `target` field on each `TUTORIAL_STEPS` move entry), a "✓ Nicely done!" success badge + new `tutorial-success` sound cue on a correct guided move, a fade-in transition between steps, and a celebratory gold-glow border + win chime on the outro step. Scope was explicitly kept to polish only, per user's call: still foolproof (only the correct pit is ever clickable — no wrong-move/retry logic), still the same 5 steps (no lesson-picker menu), still stateless (no localStorage completion tracking). `#hint`/scenario buttons untouched — they still use the original plain hint element. Verified via scripted Playwright run through all 5 steps (intro → sowing → capture → relay → outro → back to normal play) plus a Midnight-theme spot check; zero console/page errors.

**Top of the queue:** The real Tsoro Yematatu as a separate variant (its own game engine — a bigger lift) — or Phase 4 online multiplayer (blocked on a backend/accounts decision, see below) — or Phase 3's optional MCTS.

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

## Phase 2 — Polish ✅

- ✅ Seed-sowing animation — batch arc flight (all seeds from source simultaneously, staggered); relay and capture chains animate continuously
- ✅ Responsive layout — viewport meta tag, mobile media query (≤480px), examples label hidden on small screens
- ✅ Undo — history stack (human moves only); button greyed when empty/animating; cleared on reset/scenario
- ✅ End-game screen — overlay modal with winner name and "Play again" button
- ✅ Distinct visuals/sound for relay vs capture — gold pulsing ring + rising two-note chime on relay pit; red pulsing ring on captured/landing pits + low-thud/bright-ring on capture (synthesized via Web Audio, no asset files)
- ✅ Sound effects — soft seed-landing tick per seed, quiet close-out tone on plain turn-end, ascending win flourish, UI click on buttons; mute toggle (🔊/🔇) persisted via localStorage
- ✅ Themes / color palette — Wood (default), Midnight, Savanna, Charcoal; CSS custom properties drive both UI chrome and the SVG board gradients, selectable via a pill row, persisted via localStorage
- ✅ Move history panel — compact numbered list (player, pit, result badge) above the detailed move log; click a row to scroll the matching log entry into view; kept in sync with undo/reset/scenario loads

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

- ✅ History & rules page with attribution to Shona origin — `history.html`, linked from `index.html` and the play page footer; also fixed a pre-existing naming error (this game was mislabeled "Tsoro Yematatu", which is actually a different alignment game — corrected to plain "Tsoro" in the README and the new page)
- ✅ Tutorial mode — "🎓 Guided tutorial" button walks through 5 steps (intro → sowing → capture → relay → outro) on curated boards, one guided move per concept; Next/Exit controls, Undo disabled during tutorial, cleanly exits back to normal play via any of New game/scenario/mode/theme buttons
- 👷 Variant selector — add the *real* Tsoro Yematatu (3-piece alignment game) as sibling — this is a new game engine, not a mancala variant; scope similar to a second mini-project
- ✅ Credits & cultural sources — sourced and cited on `history.html` (Wikipedia's Tsoro and Tsoro Yematatu articles, verified via fetch; Mancala World per earlier research)

## Phase 6 — Ship

- ✅ Permanent static host — GitHub Pages (https://tafadzwaelphas.github.io/tsoro/), auto-deploys from `main` on push; switched from Netlify 2026-07-12 after its free tier blocked deploys on a credit-usage error
- 👷 Custom domain (optional)
- 👷 Mobile wrap via Capacitor / Tauri (optional)

---

## Known open questions / decisions to revisit

- Starting seeds = 2 was a sources-disagreement call; revisit if early playtesting feels off (some sources suggest 3).
- Currently no "draw by agreement" mechanism — sources mention this exists in real play.
- **Online multiplayer (Phase 4) is blocked on two decisions**, asked and not yet answered: (1) sync backend — managed realtime DB (Firebase/Supabase, no server to run) vs. a custom WebSocket server (own hosting) vs. polling via Netlify Functions; (2) what "accounts" means — room-code-only (no login) vs. lightweight anonymous identity vs. full sign-up. Needs the user's call before any implementation, since it means creating third-party accounts or standing up/hosting a server.
