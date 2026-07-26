# Tsoro — Project Plan

A digital build of the classic Shona/Southern African mancala **Tsoro** (sometimes *Tsoro YeHwari*), played on a 4-row board.

This is a living document. We'll edit and refine it as the project evolves.

---

## Phase 0 — Decisions ✅

- **Variant:** *Tsoro* — the 4-row Shona mancala from Zimbabwe (the family that includes Bao and Omweso). Played on **4 rows × 7 holes**. Each player owns the two rows nearest them (their *outer* / back row and *inner* / front row).
- **Tech stack:** plain HTML / CSS / JavaScript. No framework, no build step. Runs anywhere, easy to share.
- **Canonical rules source:** Wikipedia's *Tsoro* article + Mancala World, cross-referenced. (Summarized below.)

---

## Rules summary (single source of truth)

**Board.** 4 rows × 7 holes. Each player controls the 2 rows on their side: an *outer* (back) row and *inner* (front) row. Each player's two rows form a closed loop that the player sows around.

```
     ┌─┬─┬─┬─┬─┬─┬─┐   ← Player 2 outer row
     ├─┼─┼─┼─┼─┼─┼─┤   ← Player 2 inner row
     ├─┼─┼─┼─┼─┼─┼─┤   ← Player 1 inner row
     └─┴─┴─┴─┴─┴─┴─┘   ← Player 1 outer row
```

**Setup.** All holes start with the same number of seeds. Common choice: **2 seeds per hole** (28 holes × 2 = 56 total). To be confirmed at start of Phase 1.

**A turn.** Pick any of your own holes that contains ≥2 seeds. Empty it. Sow one seed per hole into the succeeding holes of *your own two rows*, going in a fixed direction maintained for the entire game.

**Relay (continue sowing).** If your last seed lands in a **non-empty hole on your outer row**, pick up everything in that hole and keep sowing.

**Capture.** If your last seed lands in a hole on your **inner row** *and* the opponent's **inner-row hole** in that same column is non-empty, capture all seeds from both of the opponent's holes in that column (inner + outer). Then continue sowing those captured seeds. If the opponent's inner-row hole is empty, no capture happens — even if their outer-row hole in that column has seeds.

**Turn ends when** the last seed lands either:
- in an **empty hole on your outer row**, or
- in a hole on your **inner row** whose opposing inner-row hole is empty (no capture possible, regardless of the opposing outer-row hole).

**Win.** The game ends when one player has had all their seeds captured. The other player wins.

**Open rule details to settle in Phase 1:**
- Confirm starting seed count (2 or 3 per hole — sources differ).
- Pin down the exact sowing path within a player's two-row loop (direction convention).
- Edge case: what happens if a player has no legal move on their turn? (Standard ruling: they lose, but should confirm.)

---

## Phase 1 — Game engine (no UI, just logic) ✅

The foundation. Mancala rules are deceptively fiddly — relay sowing and capture chains are where bugs hide. Heavy investment in tests pays off.

- Board representation: 28 pits indexed 0–27, each holding an integer seed count. Helper functions for `(player, row, col) → pit_index` and the inverse.
- Path definition: each player's sowing path as an ordered list of pit indices (closed loop over their own 2 rows).
- Column mapping: given an inner-row pit, return the opponent's two opposing pits for capture.
- Move generation: legal source holes for the current player (own holes with ≥2 seeds).
- Move application: empty source, sow one-per-hole along player's path, handle relay (last-seed-in-non-empty-outer → continue), handle capture (last-seed-in-inner-with-non-empty-opposite-column → grab and continue).
- End-of-game detection.
- Test suite of hand-crafted positions covering: simple sowing, multi-lap relay, capture, capture chain, no-capture-because-opposite-empty, end-of-game.
- CLI runner: print board ASCII (4×7 grid, current player marked), prompt for a hole, loop until win.

**Done when:** we can play a complete game end-to-end via CLI, with all rules enforced and a passing test suite.

**Outcome:** Engine + 17 passing tests + `play.html` console + `test.html` browser test runner. CLI runner was replaced with a browser-based console since no Node was available locally; consistent with the no-build-step stack decision.

---

## Phase 1.5 — Minimal UI

- Render the 4×7 board in HTML/CSS (or SVG).
- Click your own hole → engine validates → board updates.
- Show seed counts in each pit.
- Highlight legal source holes for the current player.
- Whose turn it is; capture / relay events surfaced clearly.
- Ugly but playable.

**Done when:** a stranger can play a full game in the browser.

---

## Phase 2 — Polish (the bells and whistles)

- Seed-sowing animation — seeds visibly travel hole-to-hole. This is the heart of mancala UX.
- Distinct visuals/sound for relay vs capture.
- Sounds, themes, responsive layout.
- Move history + undo, end-game screen.

---

## Phase 3 — AI opponent

- Random legal move (baseline).
- Greedy: maximize seeds captured this turn.
- Minimax with alpha-beta pruning (state space is large but board is small enough for moderate depth).
- Possibly MCTS for stronger play.
- Difficulty levels exposed in UI.

---

## Phase 4 — Multiplayer

- Local pass-and-play first.
- Online later (server, lobby, sync) — much bigger lift.

---

## Phase 5 — Cultural / educational layer

The part that makes this **Tsoro** and not just another mancala clone.

- "History & rules" page with proper attribution to Shona origin and Zimbabwe.
- Tutorial mode that teaches the game in a few guided turns.
- Possibly: variant selector (Tsoro Yematatu — the 3-piece alignment game — would be a natural sibling, since *tsoro* is a generic Shona term for board games).
- Credits / sources for cultural research.

---

## Phase 6 — Ship

- Deploy as a static site (GitHub Pages, Netlify, Vercel — all free).
- Optionally wrap for mobile later.

---

## Immediate next step

Phase 1 is complete. The two natural next moves:
1. **Phase 1.5** — SVG-based proper board render to replace the barebones `play.html` console.
2. **Deploy** — finish Netlify Drop deploy for a shareable link.

See `TASKS.md` for the operational checklist with status per sub-task.
