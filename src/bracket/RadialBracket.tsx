import { useMemo } from 'react';
import { Theme } from '../theme';
import {
  BracketStyle,
  buildLevels,
  buildSkeleton,
  VIEW,
} from './geometry';

interface Props {
  theme: Theme;
  lineWeight?: number;
  showDots?: boolean;
  style?: BracketStyle;
}

/** Static radial skeleton: connectors, spokes, junction dots, and center trophy. */
export function RadialBracket({
  theme,
  lineWeight = 1.6,
  showDots = true,
  style = 'curved',
}: Props) {
  const { spokes, connectors, dots } = useMemo(
    () => buildSkeleton(buildLevels(), style),
    [style]
  );

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke={theme.ink}
        strokeWidth={lineWeight}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.92}
      >
        {connectors.map((c, i) => (
          <path key={`c${i}`} d={c.d} />
        ))}
        {spokes.map((s, i) => (
          <line key={`s${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>

      {showDots && (
        <g fill={theme.ink} stroke="none">
          {dots.map((d, i) => (
            <circle key={`d${i}`} cx={d.x} cy={d.y} r={3.1} />
          ))}
        </g>
      )}

      {/* clear the center for the trophy */}
      <circle cx="490" cy="490" r="58" fill={theme.paper} stroke="none" />

      <g
        transform="translate(490,490)"
        stroke={theme.ink}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M-30,-46 L30,-46 C29,-20 19,-2 9,2 L-9,2 C-19,-2 -29,-20 -30,-46 Z" fill={theme.gold} />
        <path d="M-30,-44 C-49,-42 -49,-13 -31,-11" fill="none" />
        <path d="M30,-44 C49,-42 49,-13 31,-11" fill="none" />
        <path d="M-7,2 L7,2 L5,18 L-5,18 Z" fill={theme.gold} />
        <path d="M-16,18 L16,18 L20,30 L-20,30 Z" fill={theme.gold} />
        <path d="M-25,30 L25,30 L25,41 L-25,41 Z" fill={theme.gold} />
        <line x1="-19" y1="-38" x2="19" y2="-38" stroke={theme.ink} strokeWidth={1} opacity={0.5} />
      </g>
    </svg>
  );
}
