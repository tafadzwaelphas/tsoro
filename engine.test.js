import {
  P1, P2, TOTAL_PITS, STARTING_SEEDS,
  initialState, legalMoves, applyMove,
  SOWING_PATH, opposingColumn, ownerOf,
  pitOf, rowOf, colOf,
} from './engine.js';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function assertEq(actual, expected, msg = '') {
  if (!eq(actual, expected)) {
    throw new Error(
      `${msg ? msg + '\n' : ''}  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`
    );
  }
}

function assert(cond, msg = 'assertion failed') {
  if (!cond) throw new Error(msg);
}

// Build a state with a hand-crafted board.
function mkState(boardSpec, turn = P1) {
  const board = new Array(TOTAL_PITS).fill(0);
  for (const [pit, count] of Object.entries(boardSpec)) {
    board[Number(pit)] = count;
  }
  return { board, turn, phase: 'play', winner: null };
}

// ---------------------------------------------------------------------------

test('initial state', () => {
  const s = initialState();
  assertEq(s.board.length, TOTAL_PITS);
  assert(s.board.every((c) => c === STARTING_SEEDS), 'every pit starts with 2 seeds');
  assertEq(s.turn, P1);
  assertEq(s.phase, 'play');
  assertEq(s.winner, null);
});

test('owner mapping: rows 0–1 are P2, rows 2–3 are P1', () => {
  for (let p = 0; p < 14; p++) assertEq(ownerOf(p), P2, `pit ${p}`);
  for (let p = 14; p < 28; p++) assertEq(ownerOf(p), P1, `pit ${p}`);
});

test('pit/row/col helpers round-trip', () => {
  for (let p = 0; p < TOTAL_PITS; p++) {
    assertEq(pitOf(rowOf(p), colOf(p)), p);
  }
});

test('legalMoves at start: all 14 of P1 pits are legal', () => {
  const moves = legalMoves(initialState());
  assertEq(moves.length, 14);
  for (const p of moves) assertEq(ownerOf(p), P1);
});

test('legalMoves: pit with <2 seeds is excluded', () => {
  const s = mkState({ 27: 1, 26: 2, 25: 0, 24: 5 }, P1);
  const moves = legalMoves(s).sort((a, b) => a - b);
  assertEq(moves, [24, 26]);
});

test('opposingColumn: P1 inner pit 14 (col 0) → P2 pits 7 and 0', () => {
  const cols = opposingColumn(14, P1).sort((a, b) => a - b);
  assertEq(cols, [0, 7]);
});

test('opposingColumn: P2 inner pit 10 (col 3) → P1 pits 17 and 24', () => {
  const cols = opposingColumn(10, P2).sort((a, b) => a - b);
  assertEq(cols, [17, 24]);
});

// ----- sow / relay / capture mechanics -----

test('simple sow ending on empty outer-row pit → turn ends', () => {
  // Clockwise P1 path starts at pit 27 (outer rightmost).
  // Sow 2 from pit 27 → path[1]=26, path[2]=25. Both outer, both empty → no relay → turn ends.
  const s = mkState({ 27: 2, 0: 2 }, P1); // give P2 seeds so game continues
  const { state, events } = applyMove(s, 27);
  assertEq(state.board[27], 0);
  assertEq(state.board[26], 1);
  assertEq(state.board[25], 1);
  assertEq(state.turn, P2);
  const last = events[events.length - 1];
  assertEq(last.type, 'turn-end');
  assertEq(last.reason, 'outer-empty');
});

test('relay: last seed lands on non-empty outer pit → continue sowing', () => {
  // Clockwise: sow 3 from pit 27 → 26, 25, 24. Pit 24 starts with 1 seed → becomes 2 → relay.
  // Relay picks up 2 from pit 24, continues → 23, 22. Both empty → no relay → turn ends.
  const s = mkState({ 27: 3, 24: 1, 0: 2 }, P1);
  const { state, events } = applyMove(s, 27);
  const relay = events.find((e) => e.type === 'relay');
  assert(relay && relay.pit === 24, 'relay event at pit 24');
  assertEq(state.board[27], 0);
  assertEq(state.board[26], 1);
  assertEq(state.board[25], 1);
  assertEq(state.board[24], 0); // emptied during relay
  assertEq(state.board[23], 1);
  assertEq(state.board[22], 1); // landing pit, was empty, now 1 → turn ends
  assertEq(state.turn, P2);
});

test('capture: last seed lands on inner row with non-empty opposing column', () => {
  // Clockwise: sow 2 from pit 22 → path[6]=21 (outer), path[7]=14 (inner col 0).
  // Opposing col 0: P2 inner pit 7, P2 outer pit 0. Put seeds there → capture.
  const s = mkState({
    22: 2,
    7: 3, 0: 4,  // capture target: 3+4 = 7 seeds
    1: 2,        // give P2 a legal move so game continues
  }, P1);
  const { state, events } = applyMove(s, 22);

  const capture = events.find((e) => e.type === 'capture');
  assert(capture, 'capture happened');
  assertEq(capture.seeds, 7);
  assertEq(capture.at, 14);
  assertEq(state.board[7], 0);
  assertEq(state.board[0], 0);
  // pit 14 keeps its 1 landing seed; captured seeds continue sowing from there.
  // 7 seeds from cursor at 14 (index 7): path[8..14] = 15,16,17,18,19,20, wrap to 27. 7 pits.
  assertEq(state.board[14], 1);
  assertEq(state.board[15], 1);
  assertEq(state.board[16], 1);
  assertEq(state.board[17], 1);
  assertEq(state.board[18], 1);
  assertEq(state.board[19], 1);
  assertEq(state.board[20], 1);
  assertEq(state.board[27], 1);
});

test('inner row but opposing column empty → no capture, turn ends', () => {
  // Clockwise: sow 2 from pit 22 → 21 (outer), 14 (inner col 0).
  // Opposing col 0: pits 7 and 0, both empty → no capture.
  const s = mkState({ 22: 2, 1: 2 }, P1);
  const { state, events } = applyMove(s, 22);
  assert(!events.some((e) => e.type === 'capture'), 'no capture');
  const last = events[events.length - 1];
  assertEq(last.type, 'turn-end');
  assertEq(last.reason, 'inner-no-capture');
  assertEq(state.turn, P2);
});

test('capture chain: first capture leads to landing on another capture-eligible inner pit', () => {
  // Clockwise: sow 2 from pit 22 → 21 (outer), 14 (inner col 0).
  // Capture col 0: pits [7,0] = 1+1 = 2 seeds. Continue sowing 2 from cursor at 14.
  // → path[8]=15 (inner col 1), path[9]=16 (inner col 2, lastPit). Opp col 2 = pits [9,2] → 2nd capture.
  const s = mkState({
    22: 2,
    7: 1, 0: 1,   // first capture: 2 seeds
    9: 3, 2: 3,   // second capture: 6 seeds (col 2: P2 inner pit 9, P2 outer pit 2)
    5: 2,         // P2 legal move
  }, P1);
  const { state, events } = applyMove(s, 22);
  const captures = events.filter((e) => e.type === 'capture');
  assertEq(captures.length, 2);
  assertEq(captures[0].at, 14);
  assertEq(captures[0].seeds, 2);
  assertEq(captures[1].at, 16);
  assertEq(captures[1].seeds, 6);
  // After 2nd capture at 16 (index 9), sow 6: →17,18,19,20,27,26. lastPit=26 (outer, 1 seed → turn ends).
  const last = events[events.length - 1];
  assertEq(last.type, 'turn-end');
  assertEq(last.reason, 'outer-empty');
  assertEq(last.pit, 26);
});

test('end of game: opponent has zero seeds left after move', () => {
  // Clockwise: sow 2 from pit 22 → 21, 14 (inner col 0). Capture pits [7,0] = P2's only seeds.
  const s = mkState({ 22: 2, 7: 1, 0: 1 }, P1);
  const { state } = applyMove(s, 22);
  assertEq(state.phase, 'ended');
  assertEq(state.winner, P1);
});

test('end of game: opponent has no legal moves (all pits <2 seeds)', () => {
  // Clockwise: sow 2 from pit 27 → 26, 25 (both outer, no capture possible). P2 has only 1-seed pits.
  const s = mkState({
    27: 2,
    0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
    7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0,
  }, P1);
  const { state } = applyMove(s, 27);
  assertEq(state.phase, 'ended');
  assertEq(state.winner, P1);
});

test('seed conservation: total seeds change only by captures', () => {
  // Clockwise: sow 5 from pit 26 → 25,24,23,22,21 (all outer). No inner row landing → no capture.
  const s = mkState({ 26: 5, 0: 2 }, P1);
  const before = s.board.reduce((a, b) => a + b, 0);
  const { state } = applyMove(s, 26);
  const after = state.board.reduce((a, b) => a + b, 0);
  assertEq(before, after);
});

test('cannot move opponent pit', () => {
  const s = mkState({ 5: 5 }, P1);
  let threw = false;
  try { applyMove(s, 5); } catch (e) { threw = true; }
  assert(threw, 'expected error when moving opponent pit');
});

test('cannot move pit with <2 seeds', () => {
  const s = mkState({ 21: 1 }, P1);
  let threw = false;
  try { applyMove(s, 21); } catch (e) { threw = true; }
  assert(threw, 'expected error when source has <2 seeds');
});

// ---------------------------------------------------------------------------

export function runTests({ log = console.log } = {}) {
  let passed = 0, failed = 0;
  const results = [];
  for (const { name, fn } of tests) {
    try {
      fn();
      log(`  PASS  ${name}`);
      results.push({ name, ok: true });
      passed++;
    } catch (e) {
      log(`  FAIL  ${name}`);
      log(`        ${e.message.replace(/\n/g, '\n        ')}`);
      results.push({ name, ok: false, error: e.message });
      failed++;
    }
  }
  log(`\n${passed} passed, ${failed} failed (${tests.length} total)`);
  return { passed, failed, total: tests.length, results };
}

// Auto-run when imported directly in Node.
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('engine.test.js')) {
  const { failed } = runTests();
  process.exit(failed > 0 ? 1 : 0);
}
