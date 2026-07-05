// The normalized bracket state the UI renders. Decoupled from any data provider.

export interface Team {
  /** Stable id (provider team id, or ISO-ish code in sample mode). */
  id: string;
  name: string;
  /** Short flag/crest code for circle-flags fallback (e.g. "ar", "gb-eng"). */
  code?: string;
  /** Direct logo/flag image URL (provider-supplied). Takes priority over code. */
  logo?: string;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  /** Round level 1..5 (1 = Round of 32, 5 = Final). */
  round: number;
  /** Index within the round (0-based), in visual slot order. */
  index: number;
  teamA?: Team;
  teamB?: Team;
  scoreA?: number;
  scoreB?: number;
  status: MatchStatus;
  /** 'A' | 'B' once decided (includes penalties resolved upstream). */
  winner?: 'A' | 'B';
}

export interface BracketState {
  /** The 32 R32 participants in visual slot order (index 0..31). */
  leaves: (Team | undefined)[];
  /** matches[L] for L=1..5 (index 0 unused). matches[1] has 16, ... matches[5] has 1. */
  matches: Match[][];
  champion?: Team;
  /** Most advanced round that has any result, 0 = none played yet. */
  currentRound: number;
}

export const ROUND_LABELS: Record<number, string> = {
  1: 'Round of 32',
  2: 'Round of 16',
  3: 'Quarter-finals',
  4: 'Semi-finals',
  5: 'Final',
};

/** Number of matches at each level (index 0 unused). */
export const ROUND_SIZES = [0, 16, 8, 4, 2, 1] as const;

function decide(m: Match): 'A' | 'B' | undefined {
  if (m.scoreA == null || m.scoreB == null) return undefined;
  if (m.status !== 'finished') return undefined;
  if (m.scoreA === m.scoreB) return undefined; // ties resolved by provider via penalties
  return m.scoreA > m.scoreB ? 'A' : 'B';
}

function winnerTeam(m: Match): Team | undefined {
  if (!m.winner) return undefined;
  return m.winner === 'A' ? m.teamA : m.teamB;
}

/**
 * Given leaves + per-round scores, fill in winners and propagate them inward so
 * each round's matches receive the winners of the two feeding matches. This is
 * the generalization of the V2 export's results -> winnersLayer logic across all
 * five rounds. Mutates/derives a fresh state and returns it.
 */
export function resolveBracket(
  leaves: (Team | undefined)[],
  matches: Match[][]
): BracketState {
  let currentRound = 0;

  // Round 1 teams come straight from the leaves (slot 2i vs 2i+1).
  for (let i = 0; i < ROUND_SIZES[1]; i++) {
    const m = matches[1][i];
    m.teamA = m.teamA ?? leaves[2 * i];
    m.teamB = m.teamB ?? leaves[2 * i + 1];
  }

  for (let L = 1; L <= 5; L++) {
    let roundHasResult = false;
    for (const m of matches[L]) {
      m.winner = decide(m);
      if (m.winner || m.status === 'live' || m.scoreA != null) roundHasResult = true;
      // Feed the winner into the next round's slot.
      if (L < 5 && m.winner) {
        const next = matches[L + 1][Math.floor(m.index / 2)];
        const wt = winnerTeam(m);
        if (m.index % 2 === 0) next.teamA = next.teamA ?? wt;
        else next.teamB = next.teamB ?? wt;
      }
    }
    if (roundHasResult) currentRound = L;
  }

  const finalMatch = matches[5][0];
  const champion = finalMatch.winner ? winnerTeam(finalMatch) : undefined;

  return { leaves, matches, champion, currentRound };
}

/** Build an empty matches structure (levels 1..5). */
export function emptyMatches(): Match[][] {
  const matches: Match[][] = [[]];
  for (let L = 1; L <= 5; L++) {
    const arr: Match[] = [];
    for (let i = 0; i < ROUND_SIZES[L]; i++) {
      arr.push({ round: L, index: i, status: 'scheduled' });
    }
    matches.push(arr);
  }
  return matches;
}

/** Ids of every team that lost a match at any round (i.e. is eliminated). */
export function lostTeamIds(state: BracketState): Set<string> {
  const lost = new Set<string>();
  for (let L = 1; L <= 5; L++) {
    for (const m of state.matches[L]) {
      if (m.winner) {
        const loser = m.winner === 'A' ? m.teamB : m.teamA;
        if (loser) lost.add(loser.id);
      }
    }
  }
  return lost;
}

/**
 * Keys "L:index" of the matches that are up next — the earliest round that still
 * has a ready (both teams known) but undecided match. This is the current
 * frontier of play: once every match in a round is decided, the frontier moves
 * inward. Returns an empty set before any result exists (pre-tournament) and
 * once the Final is decided, so nothing blinks at those times.
 */
export function nextMatchKeys(state: BracketState): Set<string> {
  const keys = new Set<string>();
  if (state.currentRound < 1) return keys;
  for (let L = 1; L <= 5; L++) {
    const ready = state.matches[L].filter((m) => m.teamA && m.teamB && !m.winner);
    if (ready.length) {
      for (const m of ready) keys.add(`${L}:${m.index}`);
      break; // only highlight the frontier round
    }
  }
  return keys;
}

/** Set of leaf indices whose team has been eliminated (lost any round). */
export function eliminatedLeaves(state: BracketState): Set<number> {
  const out = new Set<number>();
  const lost = lostTeamIds(state);
  state.leaves.forEach((t, i) => {
    if (t && lost.has(t.id)) out.add(i);
  });
  return out;
}
