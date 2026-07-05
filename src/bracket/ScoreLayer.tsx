import { useMemo } from 'react';
import { Theme } from '../theme';
import { BracketState, Match } from './bracketModel';
import { R, buildLevels, nodeAngles, pctX, pctY, pt } from './geometry';

/** Radius for a round's score pill: in the gap just inside the feeding ring. */
function scoreRadius(L: number): number {
  return R[L] + (R[L - 1] - R[L]) * 0.48;
}

function hasScore(m: Match): boolean {
  return m.scoreA != null && m.scoreB != null && m.status !== 'scheduled';
}

/** Score pills ("1 – 2") for every played match, winner bold / loser faded. */
export function ScoreLayer({ state, theme }: { state: BracketState; theme: Theme }) {
  const levels = useMemo(() => buildLevels(), []);

  const numStyle = (win: boolean) => ({
    fontSize: '12px',
    fontWeight: win ? 800 : 600,
    color: theme.ink,
    opacity: win ? 1 : 0.42,
    fontVariantNumeric: 'tabular-nums' as const,
    lineHeight: 1,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {[1, 2, 3, 4, 5].map((L) => {
        const angles = nodeAngles(levels, L);
        const rad = scoreRadius(L);
        return state.matches[L].map((m, i) => {
          if (!hasScore(m)) return null;
          const p = pt(angles[i], rad);
          const aWon = (m.scoreA ?? 0) >= (m.scoreB ?? 0);
          return (
            <div
              key={`${L}-${i}`}
              style={{
                position: 'absolute',
                left: `${pctX(p.x)}%`,
                top: `${pctY(p.y)}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '999px',
                background: theme.paper,
                boxShadow: `0 0 0 1px ${theme.ringColor}`,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={numStyle(aWon)}>{m.scoreA}</span>
              <span style={{ fontSize: '9px', opacity: 0.4, color: theme.ink }}>–</span>
              <span style={numStyle(!aWon)}>{m.scoreB}</span>
            </div>
          );
        });
      })}
    </div>
  );
}
