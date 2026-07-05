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
  const [showCredits, setShowCredits] = useState(false);
  const theme = makeTheme(paper);
  const { state, isSample, loading, error, roundsPlayed, setRoundsPlayed } =
    useLiveBracket();

  const roundsLabel =
    roundsPlayed === 0
      ? 'Pre-tournament'
      : roundsPlayed === 5
        ? 'Champion crowned'
        : `Through ${ROUND_LABELS[roundsPlayed]}`;

  const live = !loading && !isSample;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: theme.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(10px, 3vw, 24px) clamp(6px, 2vw, 16px)',
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
          className={live ? 'live-badge' : undefined}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
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
          {live && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'currentColor',
                display: 'inline-block',
              }}
            />
          )}
          {loading ? 'Loading…' : isSample ? 'Sample data' : 'Live'}
        </span>

        <button
          type="button"
          onClick={() => setPaper(theme.dark ? '#F1EDE2' : '#16140F')}
          aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme.dark ? 'Light mode' : 'Dark mode'}
          style={{
            position: 'relative',
            width: 54,
            height: 28,
            borderRadius: 999,
            border: `1px solid ${theme.ringColor}`,
            background: theme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'background 0.3s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: theme.dark ? 28 : 2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: theme.dark ? '#0F0D09' : '#FFFFFF',
              color: theme.gold,
              boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              lineHeight: 1,
              transition: 'left 0.3s ease, background 0.3s ease',
            }}
          >
            {theme.dark ? '☾' : '☀'}
          </span>
        </button>

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
          width: '100%',
          maxWidth: 1000,
          background: theme.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(14px, 3vw, 40px)',
          padding: 'clamp(18px, 4vw, 60px) clamp(8px, 2.5vw, 56px)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          boxShadow: theme.dark
            ? '0 10px 40px rgba(0,0,0,0.5)'
            : '0 10px 40px rgba(0,0,0,0.10)',
          borderRadius: 'clamp(10px, 3vw, 16px)',
        }}
      >
        <Header state={state} theme={theme} />

        <div
          style={{
            position: 'relative',
            width: 'min(100%, 900px)',
            aspectRatio: '1 / 1',
            // Anchor container-query units so the score pills scale with the bracket.
            containerType: 'inline-size',
          }}
        >
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
      </div>

      {/* Info button — fixed bottom-left */}
      <button
        type="button"
        onClick={() => setShowCredits(c => !c)}
        aria-label="Credits"
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1px solid ${theme.ringColor}`,
          background: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          color: theme.ink,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          opacity: 0.7,
          zIndex: 100,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
      >
        ⓘ
      </button>

      {/* Credits popup */}
      {showCredits && (
        <>
          <div
            onClick={() => setShowCredits(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 101,
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 60,
              left: 16,
              zIndex: 102,
              background: theme.dark ? '#1E1C17' : '#FFFFFF',
              border: `1px solid ${theme.ringColor}`,
              borderRadius: 12,
              padding: '16px 20px',
              boxShadow: theme.dark
                ? '0 8px 32px rgba(0,0,0,0.6)'
                : '0 8px 32px rgba(0,0,0,0.14)',
              minWidth: 260,
              color: theme.ink,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 15 }}>Credits</p>
            <table style={{ borderSpacing: '8px 6px', margin: -8 }}>
              <tbody>
                {[
                  ['Original graphic', 'Emilio Sansolini', 'https://www.behance.net/emiliosansolini'],
                  ['Human author', 'OrMosco', 'https://github.com/OrMosco'],
                  ['Source code', 'OrMosco/mondial2026', 'https://github.com/OrMosco/mondial2026'],
                ].map(([label, text, href]) => (
                  <tr key={label}>
                    <td style={{ fontSize: 13, opacity: 0.55, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}</td>
                    <td style={{ fontSize: 13 }}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: theme.ink, textDecoration: 'underline', textUnderlineOffset: 2 }}
                      >
                        {text}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
