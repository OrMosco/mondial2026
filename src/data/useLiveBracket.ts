import { useCallback, useEffect, useRef, useState } from 'react';
import { BracketState } from '../bracket/bracketModel';
import { fetchLiveBracket } from './worldCup26';
import { sampleBracket } from './sampleData';

const POLL_MS = Number(import.meta.env.VITE_POLL_MS ?? 60000);

export interface LiveBracket {
  state: BracketState | null;
  isSample: boolean;
  loading: boolean;
  error: string | null;
  /** Sample mode only: how many rounds are revealed (0..5). */
  roundsPlayed: number;
  setRoundsPlayed: (n: number) => void;
  refresh: () => void;
}

export function useLiveBracket(): LiveBracket {
  const [state, setState] = useState<BracketState | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState(5);
  const sampleRef = useRef(false);
  // Last successful live bracket — kept so a transient fetch blip (429/network)
  // doesn't snap a live view back to sample data.
  const lastLiveRef = useRef<BracketState | null>(null);

  const load = useCallback(async () => {
    try {
      const live = await fetchLiveBracket();
      if (live) {
        lastLiveRef.current = live;
        sampleRef.current = false;
        setIsSample(false);
        setState(live);
        setError(null);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // If we were already live, keep the last good bracket on a transient error.
      if (lastLiveRef.current) {
        sampleRef.current = false;
        setIsSample(false);
        setState(lastLiveRef.current);
        return;
      }
    }
    // Fallback: bundled sample data.
    sampleRef.current = true;
    setIsSample(true);
    setState(sampleBracket(roundsPlayed));
  }, [roundsPlayed]);

  // Initial load + polling (live mode only; sample data is static).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (sampleRef.current) return;
    const id = setInterval(() => {
      void load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // In sample mode, reflect the scrubber immediately without refetching.
  useEffect(() => {
    if (sampleRef.current) setState(sampleBracket(roundsPlayed));
  }, [roundsPlayed]);

  return {
    state,
    isSample,
    loading,
    error,
    roundsPlayed,
    setRoundsPlayed,
    refresh: () => void load(),
  };
}
