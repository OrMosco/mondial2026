import {
  BracketState,
  Match,
  Team,
  emptyMatches,
  resolveBracket,
} from '../bracket/bracketModel';

// 32-team sample field, in the same visual slot order as the original design
// export. Flags resolve via the circle-flags CDN by these codes.
const SAMPLE: { code: string; name: string }[] = [
  { code: 'de', name: 'Germany' },
  { code: 'br', name: 'Brazil' },
  { code: 'jp', name: 'Japan' },
  { code: 'ie', name: 'Ireland' },
  { code: 'no', name: 'Norway' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'gb-eng', name: 'England' },
  { code: 'cd', name: 'DR Congo' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cv', name: 'Cape Verde' },
  { code: 'au', name: 'Australia' },
  { code: 'eg', name: 'Egypt' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'dz', name: 'Algeria' },
  { code: 'co', name: 'Colombia' },
  { code: 'gh', name: 'Ghana' },
  { code: 'sn', name: 'Senegal' },
  { code: 'be', name: 'Belgium' },
  { code: 'ba', name: 'Bosnia' },
  { code: 'us', name: 'United States' },
  { code: 'at', name: 'Austria' },
  { code: 'es', name: 'Spain' },
  { code: 'hr', name: 'Croatia' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ma', name: 'Morocco' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'ca', name: 'Canada' },
  { code: 'za', name: 'South Africa' },
  { code: 'se', name: 'Sweden' },
  { code: 'fr', name: 'France' },
  { code: 'py', name: 'Paraguay' },
];

export function flagUrl(code: string): string {
  return `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;
}

// Per-round scores [home, away]. Round of 32 reuses the exact results from the
// V2 design export so sample mode reproduces that "after a match" state.
const SCORES: number[][][] = [
  // Round of 32 (16)
  [
    [1, 2], [2, 0], [2, 1], [0, 3], [0, 2], [1, 0], [1, 2], [2, 1],
    [0, 1], [3, 1], [2, 0], [2, 1], [1, 0], [3, 2], [0, 1], [4, 0],
  ],
  // Round of 16 (8)
  [[2, 1], [1, 0], [0, 2], [3, 1], [1, 2], [2, 0], [0, 1], [2, 3]],
  // Quarter-finals (4)
  [[1, 0], [2, 1], [0, 2], [3, 2]],
  // Semi-finals (2)
  [[2, 1], [1, 2]],
  // Final (1)
  [[2, 1]],
];

function team(i: number): Team {
  const s = SAMPLE[i];
  return { id: `s-${s.code}`, name: s.name, code: s.code, logo: flagUrl(s.code) };
}

/**
 * Build a sample bracket with `roundsPlayed` rounds resolved (0..5).
 *   0 -> pre-tournament poster (V1)
 *   1 -> after Round of 32 (V2)
 *   5 -> champion crowned
 */
export function sampleBracket(roundsPlayed = 5): BracketState {
  const leaves: (Team | undefined)[] = SAMPLE.map((_, i) => team(i));
  const matches = emptyMatches();

  // Seed R1 teams.
  let state = resolveBracket(leaves, matches);

  for (let L = 1; L <= 5; L++) {
    if (L <= roundsPlayed) {
      state.matches[L].forEach((m: Match, i: number) => {
        const sc = SCORES[L - 1][i];
        m.scoreA = sc[0];
        m.scoreB = sc[1];
        m.status = 'finished';
      });
    }
    state = resolveBracket(state.leaves, state.matches);
  }
  return state;
}
