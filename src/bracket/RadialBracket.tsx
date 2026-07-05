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
      <circle cx="490" cy="490" r="60" fill={theme.paper} stroke="none" />

      {/* real FIFA World Cup trophy photo */}
      <image
        href="/trophy.png"
        x={490 - 112.5 / 2}
        y={490 - 118 / 2}
        width={112.5}
        height={118}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
