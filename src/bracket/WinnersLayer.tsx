import { useMemo } from 'react';
import { Theme } from '../theme';
import { BracketState, lostTeamIds } from './bracketModel';
import { FLAG_R, R, buildLevels, nodeAngles, pctSize, pctX, pctY, pt } from './geometry';
import { Flag } from './Flag';

// Winner flags shrink slightly as they advance toward the center.
const WIN_R = [0, FLAG_R - 4, FLAG_R - 6, FLAG_R - 7, FLAG_R - 8];

/** Winners advanced onto each inner junction ring (rounds 1..4). */
export function WinnersLayer({ state, theme }: { state: BracketState; theme: Theme }) {
  const levels = useMemo(() => buildLevels(), []);
  // Teams that advanced here but lost a later round get the off-white / grayscale
  // treatment too, matching how losing flags look at every step.
  const lost = useMemo(() => lostTeamIds(state), [state]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {[1, 2, 3, 4].map((L) => {
        const angles = nodeAngles(levels, L);
        const size = pctSize(WIN_R[L]);
        return state.matches[L].map((m, i) => {
          if (!m.winner) return null;
          const team = m.winner === 'A' ? m.teamA : m.teamB;
          const p = pt(angles[i], R[L]);
          return (
            <Flag
              key={`${L}-${i}`}
              team={team}
              theme={theme}
              leftPct={pctX(p.x)}
              topPct={pctY(p.y)}
              sizePct={size}
              dim={team ? lost.has(team.id) : false}
            />
          );
        });
      })}
    </div>
  );
}
