import { CSSProperties } from 'react';
import { Team } from './bracketModel';
import { Theme } from '../theme';
import { flagUrl } from '../data/sampleData';

interface Props {
  team?: Team;
  theme: Theme;
  /** left/top as viewBox percentages */
  leftPct: number;
  topPct: number;
  /** diameter as viewBox percentage */
  sizePct: number;
  dim?: boolean;
  /** Slow pulse to flag this team's match as coming up next. */
  blink?: boolean;
  style?: CSSProperties;
  title?: string;
}

/** A circular flag/crest chip positioned absolutely over the SVG. */
export function Flag({ team, theme, leftPct, topPct, sizePct, dim, blink, style, title }: Props) {
  const src = team?.logo ?? (team?.code ? flagUrl(team.code) : undefined);
  const base: CSSProperties = {
    position: 'absolute',
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${sizePct}%`,
    height: `${sizePct}%`,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    boxShadow: `0 0 0 1.2px ${theme.ringColor}`,
    background: theme.paper,
    objectFit: 'cover',
    transition: 'opacity 0.4s ease, filter 0.4s ease',
    ...(dim ? { opacity: 0.5, filter: 'grayscale(1)' } : null),
    ...(blink && !dim
      ? {
          animation: 'nextBlink 1.5s ease-in-out infinite',
          boxShadow: `0 0 0 2px ${theme.gold}`,
          zIndex: 2,
        }
      : null),
    ...style,
  };

  if (!src) {
    // Placeholder chip for TBD slots.
    return (
      <div
        title={title}
        style={{
          ...base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.ink,
          opacity: dim ? 0.3 : 0.35,
          fontSize: `${sizePct * 0.28}%`,
        }}
      />
    );
  }
  return <img src={src} alt={team?.name ?? ''} title={title ?? team?.name} style={base} />;
}
