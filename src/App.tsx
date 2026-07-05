import { useState } from 'react';
import { makeTheme, PaperColor } from './theme';
import { useLiveBracket } from './data/useLiveBracket';
import { ROUND_LABELS } from './bracket/bracketModel';
import { RadialBracket } from './bracket/RadialBracket';
import { FlagLayer } from './bracket/FlagLayer';
import { WinnersLayer } from './bracket/WinnersLayer';
import { ScoreLayer } from './bracket/ScoreLayer';
import { ChampionMark } from './bracket/ChampionMark';
import { Header } from './bracket/Header';

export function App() {
  const [paper, setPaper] = useState<PaperColor>('#F1EDE2');
  const theme = makeTheme(paper);
  const { state, isSample, loading, error, roundsPlayed, setRoundsPlayed } =
    useLiveBracket();

  const roundsLabel =
    roundsPlayed === 0
      ? 'Pre-tournament'
      : roundsPlayed === 5
        ? 'Champion crowned'
        : `Through ${ROUND_LABELS[roundsPlayed]}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: theme.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '24px 16px',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.ink,
          fontSize: 13,
        }}
      >
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 999,
            fontWeight: 700,
            letterSpacing: '0.08em',
            fontSize: 11,
            textTransform: 'uppercase',
            background: isSample ? 'rgba(194,166,99,0.18)' : 'rgba(40,167,69,0.16)',
            color: isSample ? theme.gold : theme.dark ? '#7CD992' : '#1B7A33',
            boxShadow: `0 0 0 1px ${theme.ringColor}`,
          }}
        >
          {loading ? 'Loading…' : isSample ? 'Sample data' : 'Live'}
        </span>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Theme
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value as PaperColor)}
            style={{ font: 'inherit' }}
          >
            <option value="#F1EDE2">Cream</option>
            <option value="#FFFFFF">White</option>
            <option value="#16140F">Dark</option>
          </select>
        </label>

        {isSample && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ whiteSpace: 'nowrap' }}>{roundsLabel}</span>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={roundsPlayed}
              onChange={(e) => setRoundsPlayed(Number(e.target.value))}
            />
          </label>
        )}

        {error && !isSample && (
          <span style={{ color: '#c0392b' }}>API error: {error}</span>
        )}
        {error && isSample && (
          <span style={{ opacity: 0.6 }}>
            (live unavailable — showing sample)
          </span>
        )}
      </div>

      {/* Poster */}
      <div
        style={{
          width: 1000,
          maxWidth: '100%',
          aspectRatio: '1000 / 1240',
          background: theme.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 56px 48px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          boxShadow: theme.dark
            ? '0 10px 40px rgba(0,0,0,0.5)'
            : '0 10px 40px rgba(0,0,0,0.10)',
          borderRadius: 8,
        }}
      >
        <Header state={state} theme={theme} />

        <div style={{ position: 'relative', width: '88%', aspectRatio: '1 / 1' }}>
          <RadialBracket theme={theme} />
          {state && (
            <>
              <FlagLayer state={state} theme={theme} />
              <WinnersLayer state={state} theme={theme} />
              <ScoreLayer state={state} theme={theme} />
              <ChampionMark state={state} theme={theme} />
            </>
          )}
        </div>

        <div style={{ fontSize: 18, color: theme.ink, opacity: 0.7, lineHeight: 1 }}>✦</div>
      </div>
    </div>
  );
}
