# Tsoro — Quick Status View

> 👷 Not started · ⏳ In progress · ✅ Complete

---

## Phase 0 — Decisions ✅

| Task | Status |
|------|--------|
| Pick variant: 4-row Tsoro (4×7 board) | ✅ |
| Tech stack: plain HTML/CSS/JS, no build step | ✅ |
| Canonical rules: Wikipedia + Mancala World | ✅ |
| Starting seeds = 2/hole | ✅ |
| Sowing path conventions | ✅ |
| No-legal-moves → current player loses | ✅ |

---

## Phase 1 — Game Engine ✅

| Task | Status |
|------|--------|
| Board representation (28 pits, 0–27) | ✅ |
| Sowing path definitions (P1 + P2 closed loops) | ✅ |
| Column mapping for captures (`opposingColumn`) | ✅ |
| Legal-move generation (pits with ≥2 seeds) | ✅ |
| Sowing + relay logic | ✅ |
| Capture + capture-chain logic | ✅ |
| End-of-game detection | ✅ |
| Move validation + error handling | ✅ |
| Test suite — 17 tests, all passing | ✅ |
| Browser test runner (`test.html`) | ✅ |
| Barebones playable console (`play.html`) | ✅ |
| Landing page (`index.html`) | ✅ |

---

## Phase 1.5 — Minimal UI ✅

> Shipped in `play-svg.html`. `play.html` kept as reference.

| Task | Status |
|------|--------|
| SVG board — warm wood, carved pits, ivory seeds | ✅ |
| Turn/phase indicator — colour-coded banner + row glow | ✅ |
| Legal-pit gold ring highlight | ✅ |
| Seed arc animation — all seeds launch simultaneously, staggered 70 ms, 560 ms arc each | ✅ |
| Relay/capture chain animation — inter-batch pauses between waves | ✅ |
| Worked-example buttons: Sowing / Capture / Relay scenarios | ✅ |
| ~~Hover preview (ghost seeds, rings)~~ — removed | — |
| ~~CSS flash animations (capture/landing)~~ — removed | — |

---

## Deployment ✅

| Task | Status |
|------|--------|
| Local dev server (Python `http.server` port 8765) | ✅ |
| Netlify deploy — frabjous-axolotl-99ed9c.netlify.app | ✅ |
| Deployed URL recorded in TASKS.md | ✅ |
| GitHub repo + auto-deploy | ✅ |

---

## Phase 2 — Polish ✅

| Task | Status |
|------|--------|
| Seed-sowing animation (batch arc, staggered simultaneous) | ✅ |
| Responsive layout (viewport meta + mobile media query) | ✅ |
| Undo (history stack, human moves only) | ✅ |
| End-game screen (overlay modal, "Play again") | ✅ |
| Distinct visuals/sound for relay vs capture | ✅ |
| Sound effects | ✅ |
| Themes / colour palette | ✅ |
| Move history panel | ✅ |

---

## Phase 3 — AI Opponent ✅

| Task | Status |
|------|--------|
| Baseline: random legal move (Easy) | ✅ |
| Greedy: maximise captures this turn (Medium) | ✅ |
| Minimax with alpha-beta pruning, depth 5 (Hard) | ✅ |
| Difficulty levels in UI (mode selector pill row) | ✅ |
| MCTS (optional — only if Hard proves too weak) | 👷 |

---

## Phase 4 — Multiplayer 👷

| Task | Status |
|------|--------|
| Local pass-and-play | ✅ |
| Online multiplayer (lobby, real-time sync, accounts) | 👷 |

---

## Phase 5 — Cultural / Educational 👷

| Task | Status |
|------|--------|
| History & rules page (Shona origin + attribution) | ✅ |
| Tutorial mode (guided first few turns) | ✅ |
| Variant selector — add Tsoro Yematatu (real alignment game) | 👷 |
| Credits & cultural sources | ✅ |

---

## Phase 6 — Ship 👷

| Task | Status |
|------|--------|
| Permanent static host → Netlify live ✅ | ✅ |
| Custom domain (optional) | 👷 |
| Mobile wrap via Capacitor / Tauri (optional) | 👷 |

---

## Open Questions

- Starting seeds = 2 — revisit if early playtesting feels off (some sources say 3)
- No "draw by agreement" mechanism yet
