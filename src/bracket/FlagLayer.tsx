import { useMemo } from 'react';
import { Theme } from '../theme';
import { BracketState, eliminatedLeaves } from './bracketModel';
import { FLAG_R, R, leafAngles, pctSize, pctX, pctY, pt } from './geometry';
import { Flag } from './Flag';

/** The 32 outer flags. Eliminated teams are dimmed + desaturated. */
export function FlagLayer({ state, theme }: { state: BracketState; theme: Theme }) {
  const out = useMemo(() => eliminatedLeaves(state), [state]);
  const angles = useMemo(() => leafAngles(), []);
  const size = pctSize(FLAG_R);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {state.leaves.map((team, i) => {
        const p = pt(angles[i], R[0]);
        return (
          <Flag
            key={i}
            team={team}
            theme={theme}
            leftPct={pctX(p.x)}
            topPct={pctY(p.y)}
            sizePct={size}
            dim={out.has(i)}
          />
        );
      })}
    </div>
  );
}
