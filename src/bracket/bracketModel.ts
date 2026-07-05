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
  /** Penalty shootout scores, present only when a knockout tie went to penalties. */
  penA?: number;
  penB?: number;
  /** Kickoff time (epoch ms), used to pick the single next game to highlight. */
  kickoff?: number;
  status: MatchStatus;
  /** 'A' | 'B' once decided (regular time or penalties). */
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
  if (m.status !== 'finished') return undefined;
  if (m.scoreA == null || m.scoreB == null) return undefined;
  if (m.scoreA !== m.scoreB) return m.scoreA > m.scoreB ? 'A' : 'B';
  // A finished knockout tie is settled on penalties.
  if (m.penA != null && m.penB != null && m.penA !== m.penB) {
    return m.penA > m.penB ? 'A' : 'B';
  }
  return undefined;
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
 * Key "L:index" of the single game coming up next: the ready (both teams known)
 * match that has not finished yet with the earliest kickoff. A live game — whose
 * kickoff is already in the past — naturally sorts first, so "next" becomes "now"
 * while it's being played. Returns null when nothing is pending (no fixtures
 * seeded yet, or the Final is already decided).
 */
export function nextMatchKey(state: BracketState): string | null {
  let bestKey: string | null = null;
  let bestT = Number.POSITIVE_INFINITY;
  for (let L = 1; L <= 5; L++) {
    for (const m of state.matches[L]) {
      if (!m.teamA || !m.teamB || m.status === 'finished') continue;
      const t = m.kickoff ?? Number.MAX_SAFE_INTEGER;
      if (t < bestT) {
        bestT = t;
        bestKey = `${L}:${m.index}`;
      }
    }
  }
  return bestKey;
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
