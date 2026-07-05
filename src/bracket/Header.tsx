import { Theme } from '../theme';
import { BracketState, ROUND_LABELS } from './bracketModel';

function eyebrow(state: BracketState | null): string {
  if (!state || state.currentRound === 0) return 'The Road To The Final';
  if (state.champion) return 'Champions';
  return `${ROUND_LABELS[state.currentRound]} · Results`;
}

export function Header({ state, theme }: { state: BracketState | null; theme: Theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: theme.ink,
          opacity: 0.55,
        }}
      >
        {eyebrow(state)}
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '0.01em',
          color: theme.ink,
        }}
      >
        World Cup 2026
      </h1>
    </div>
  );
}
