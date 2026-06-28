// Tsoro (4-row Shona mancala) — pure game logic.
//
// Board layout (viewer perspective):
//   row 0: P2 outer (top)        pits  0.. 6
//   row 1: P2 inner              pits  7..13
//   row 2: P1 inner              pits 14..20
//   row 3: P1 outer (bottom)     pits 21..27
// Cols 0..6 left-to-right (absolute, viewer perspective).
//
// Each player sows around their own two rows (a closed 14-pit loop), clockwise from above.
// P1 path: outer right→left (cols 6→0), then inner left→right (cols 0→6).
// P2 path: outer left→right (cols 0→6), then inner right→left (cols 6→0).

export const ROWS = 4;
export const COLS = 7;
export const TOTAL_PITS = ROWS * COLS;
export const STARTING_SEEDS = 2;
export const MIN_SEEDS_TO_SOW = 2;

export const P1 = 0;
export const P2 = 1;
const OPP = { [P1]: P2, [P2]: P1 };

export const pitOf = (row, col) => row * COLS + col;
export const rowOf = (pit) => Math.floor(pit / COLS);
export const colOf = (pit) => pit % COLS;

const INNER_ROW = { [P1]: 2, [P2]: 1 };
const OUTER_ROW = { [P1]: 3, [P2]: 0 };

export const SOWING_PATH = {
  [P1]: [27, 26, 25, 24, 23, 22, 21, 14, 15, 16, 17, 18, 19, 20],
  [P2]: [ 0,  1,  2,  3,  4,  5,  6, 13, 12, 11, 10,  9,  8,  7],
};

const PATH_INDEX = (() => {
  const make = (path) => {
    const idx = new Array(TOTAL_PITS).fill(-1);
    path.forEach((pit, i) => { idx[pit] = i; });
    return idx;
  };
  return { [P1]: make(SOWING_PATH[P1]), [P2]: make(SOWING_PATH[P2]) };
})();

export const ownerOf = (pit) => (rowOf(pit) >= 2 ? P1 : P2);
export const isInnerRow = (pit, player) => rowOf(pit) === INNER_ROW[player];
export const isOuterRow = (pit, player) => rowOf(pit) === OUTER_ROW[player];

export function opposingColumn(pit, player) {
  const c = colOf(pit);
  const opp = OPP[player];
  return [pitOf(INNER_ROW[opp], c), pitOf(OUTER_ROW[opp], c)];
}

export function initialState() {
  return {
    board: new Array(TOTAL_PITS).fill(STARTING_SEEDS),
    turn: P1,
    phase: 'play',
    winner: null,
  };
}

export function legalMoves(state) {
  if (state.phase !== 'play') return [];
  const out = [];
  for (const pit of SOWING_PATH[state.turn]) {
    if (state.board[pit] >= MIN_SEEDS_TO_SOW) out.push(pit);
  }
  return out;
}

function totalSeedsForPlayer(board, player) {
  let total = 0;
  for (const pit of SOWING_PATH[player]) total += board[pit];
  return total;
}

export function applyMove(state, sourcePit) {
  if (state.phase !== 'play') throw new Error('Game is over');
  const player = state.turn;
  if (ownerOf(sourcePit) !== player) {
    throw new Error(`Pit ${sourcePit} is not owned by current player`);
  }
  if (state.board[sourcePit] < MIN_SEEDS_TO_SOW) {
    throw new Error(`Pit ${sourcePit} needs at least ${MIN_SEEDS_TO_SOW} seeds`);
  }

  const board = [...state.board];
  const path = SOWING_PATH[player];
  const pathIdx = PATH_INDEX[player];
  const events = [];

  let cursor = pathIdx[sourcePit];
  let hand = board[sourcePit];
  board[sourcePit] = 0;
  events.push({ type: 'pickup', pit: sourcePit, seeds: hand });

  while (true) {
    let lastPit = -1;
    while (hand > 0) {
      cursor = (cursor + 1) % path.length;
      lastPit = path[cursor];
      board[lastPit]++;
      hand--;
      events.push({ type: 'sow', pit: lastPit });
    }

    if (isInnerRow(lastPit, player)) {
      const [oppInner, oppOuter] = opposingColumn(lastPit, player);
      const captured = board[oppInner] + board[oppOuter];
      if (captured > 0) {
        board[oppInner] = 0;
        board[oppOuter] = 0;
        events.push({
          type: 'capture',
          at: lastPit,
          from: [oppInner, oppOuter],
          seeds: captured,
        });
        hand = captured;
        continue;
      }
      events.push({ type: 'turn-end', reason: 'inner-no-capture', pit: lastPit });
      break;
    }

    // Outer row of current player.
    if (board[lastPit] > 1) {
      hand = board[lastPit];
      board[lastPit] = 0;
      events.push({ type: 'relay', pit: lastPit, seeds: hand });
      continue;
    }
    events.push({ type: 'turn-end', reason: 'outer-empty', pit: lastPit });
    break;
  }

  const opp = OPP[player];
  let phase = 'play';
  let winner = null;

  if (totalSeedsForPlayer(board, opp) === 0) {
    phase = 'ended';
    winner = player;
  } else {
    const oppHasMove = SOWING_PATH[opp].some((p) => board[p] >= MIN_SEEDS_TO_SOW);
    if (!oppHasMove) {
      phase = 'ended';
      winner = player;
    }
  }

  return {
    state: { board, turn: opp, phase, winner },
    events,
  };
}
