import { Theme } from '../theme';
import { BracketState } from './bracketModel';
import { CX, CY, pctSize, pctX, pctY } from './geometry';
import { Flag } from './Flag';

const CHAMP_R = 27;

/** The champion's flag crowning the center trophy, shown once the Final is decided. */
export function ChampionMark({ state, theme }: { state: BracketState; theme: Theme }) {
  if (!state.champion) return null;
  const size = pctSize(CHAMP_R);
  // Sit on the trophy cup, slightly above the geometric center.
  const cx = CX;
  const cy = CY - 8;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* gold star above the flag */}
      <div
        style={{
          position: 'absolute',
          left: `${pctX(cx)}%`,
          top: `${pctY(cy - CHAMP_R - 8)}%`,
          transform: 'translate(-50%, -50%)',
          color: theme.gold,
          fontSize: '16px',
          lineHeight: 1,
          textShadow: `0 0 2px ${theme.paper}`,
        }}
      >
        ★
      </div>
      <Flag
        team={state.champion}
        theme={theme}
        leftPct={pctX(cx)}
        topPct={pctY(cy)}
        sizePct={size}
        title={`Champions: ${state.champion.name}`}
        style={{ boxShadow: `0 0 0 2.5px ${theme.gold}` }}
      />
    </div>
  );
}
