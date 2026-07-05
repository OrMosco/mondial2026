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
          fontSize: 'clamp(9px, 2.6vw, 12px)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: theme.ink,
          opacity: 0.55,
          textAlign: 'center',
        }}
      >
        {eyebrow(state)}
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 'clamp(20px, 6vw, 30px)',
          fontWeight: 700,
          letterSpacing: '0.01em',
          color: theme.ink,
          textAlign: 'center',
        }}
      >
        World Cup 2026
      </h1>
    </div>
  );
}
