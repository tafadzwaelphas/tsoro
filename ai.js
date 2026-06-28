import { legalMoves, applyMove, SOWING_PATH, P1, P2 } from './engine.js';

const OPP = { [P1]: P2, [P2]: P1 };

function evaluate(board, aiPlayer) {
  let score = 0;
  for (const pit of SOWING_PATH[aiPlayer])      score += board[pit];
  for (const pit of SOWING_PATH[OPP[aiPlayer]]) score -= board[pit];
  return score;
}

function minimax(state, depth, alpha, beta, aiPlayer) {
  if (state.phase === 'ended') {
    return state.winner === aiPlayer ? 100000 : -100000;
  }
  if (depth === 0) return evaluate(state.board, aiPlayer);

  const moves = legalMoves(state);
  if (moves.length === 0) return evaluate(state.board, aiPlayer);

  if (state.turn === aiPlayer) {
    let best = -Infinity;
    for (const move of moves) {
      const { state: next } = applyMove(state, move);
      const val = minimax(next, depth - 1, alpha, beta, aiPlayer);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const { state: next } = applyMove(state, move);
      const val = minimax(next, depth - 1, alpha, beta, aiPlayer);
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getAIMove(state, difficulty) {
  const aiPlayer = state.turn;
  const moves = legalMoves(state);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === 'hard' ? 5 : 1;
  let bestMove = moves[0];
  let bestVal  = -Infinity;

  for (const move of moves) {
    const { state: next } = applyMove(state, move);
    const val = depth > 1
      ? minimax(next, depth - 1, -Infinity, Infinity, aiPlayer)
      : evaluate(next.board, aiPlayer);
    if (val > bestVal) { bestVal = val; bestMove = move; }
  }
  return bestMove;
}
