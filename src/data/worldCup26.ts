// Live provider backed by the free, public worldcup26.ir API.
// Reads are open (no key, no auth) and CORS is `*`, so the browser calls it
// directly — no dev proxy. The knockout bracket is built deterministically from
// each match's "Winner Match N" references, which fully specify the tree.

import {
  BracketState,
  Team,
  emptyMatches,
  resolveBracket,
} from '../bracket/bracketModel';

const BASE = import.meta.env.VITE_WC26_BASE ?? 'https://worldcup26.ir';

// --- Raw API shapes (every field arrives as a string) ---
interface ApiGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_penalty_score?: string;
  away_penalty_score?: string;
  local_date?: string; // "MM/DD/YYYY HH:mm"
  home_team_label?: string;
  away_team_label?: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  finished: string; // "TRUE" | "FALSE"
  time_elapsed: string; // "notstarted" | "finished" | "45'" | "HT" | ...
  type: string; // group | r32 | r16 | qf | sf | third | final
}
interface ApiTeam {
  id: string;
  name_en: string;
  flag: string;
  fifa_code: string;
  iso2: string;
}

const LEVEL: Record<string, number> = { r32: 1, r16: 2, qf: 3, sf: 4, final: 5 };

let teamsCache: Map<string, ApiTeam> | null = null;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`worldcup26 ${res.status} for ${path}`);
  return (await res.json()) as T;
}

async function getTeams(): Promise<Map<string, ApiTeam>> {
  if (teamsCache) return teamsCache;
  const data = await getJson<{ teams: ApiTeam[] }>('/get/teams');
  teamsCache = new Map(data.teams.map((t) => [t.id, t]));
  return teamsCache;
}

// For team ids: "0" / "null" / empty all mean "not assigned yet" (TBD).
function isNilId(v?: string): boolean {
  return v == null || v === '' || v === '0' || v.toLowerCase() === 'null';
}

function teamFromGame(
  teams: Map<string, ApiTeam>,
  id: string,
  fallbackName?: string
): Team | undefined {
  if (isNilId(id)) return undefined;
  const t = teams.get(id);
  if (t) {
    return { id, name: t.name_en, code: t.iso2?.toLowerCase(), logo: t.flag };
  }
  if (fallbackName) return { id, name: fallbackName };
  return undefined;
}

function parseScore(v?: string): number | undefined {
  // Unlike team ids, a score of "0" is a real value — only null/empty is missing.
  if (v == null || v === '' || v.toLowerCase() === 'null') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse "MM/DD/YYYY HH:mm" (the API's local_date) into epoch ms. */
function parseKickoff(v?: string): number | undefined {
  const m = v?.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const [, mm, dd, yyyy, hh, min] = m;
  const t = new Date(+yyyy, +mm - 1, +dd, +hh, +min).getTime();
  return Number.isFinite(t) ? t : undefined;
}

function statusOf(g: ApiGame): 'scheduled' | 'live' | 'finished' {
  if (String(g.finished).toUpperCase() === 'TRUE') return 'finished';
  const te = (g.time_elapsed ?? '').toLowerCase();
  if (te && te !== 'notstarted' && te !== 'finished') return 'live';
  return 'scheduled';
}

/** Extract the referenced match id from a label like "Winner Match 74". */
function refMatchId(label?: string): string | null {
  const m = label?.match(/Match\s+(\d+)/i);
  return m ? m[1] : null;
}

/**
 * Build the full BracketState from the knockout games. Walks the "Winner Match N"
 * graph from the final down to the Round of 32, assigning each match its visual
 * (level, index) slot so siblings line up, then lets resolveBracket derive
 * winners / champion.
 */
function buildBracket(games: ApiGame[], teams: Map<string, ApiTeam>): BracketState | null {
  const knockout = games.filter((g) => LEVEL[g.type] != null);
  const byId = new Map(knockout.map((g) => [g.id, g]));
  const final = knockout.find((g) => g.type === 'final');
  if (!final) return null;

  // Assign each knockout match a (level, index) by walking the reference graph.
  const slot = new Map<string, { level: number; index: number }>();
  slot.set(final.id, { level: 5, index: 0 });
  const queue = [final.id];
  while (queue.length) {
    const id = queue.shift()!;
    const { level, index } = slot.get(id)!;
    if (level === 1) continue; // R32 leaves: children are teams, not matches
    const g = byId.get(id);
    if (!g) continue;
    const h = refMatchId(g.home_team_label);
    const a = refMatchId(g.away_team_label);
    if (h && byId.has(h)) {
      slot.set(h, { level: level - 1, index: index * 2 });
      queue.push(h);
    }
    if (a && byId.has(a)) {
      slot.set(a, { level: level - 1, index: index * 2 + 1 });
      queue.push(a);
    }
  }

  const matches = emptyMatches();
  const leaves: (Team | undefined)[] = new Array(32).fill(undefined);

  for (const g of knockout) {
    const s = slot.get(g.id);
    if (!s) continue;
    const m = matches[s.level][s.index];
    m.status = statusOf(g);
    m.kickoff = parseKickoff(g.local_date);
    const tA = teamFromGame(teams, g.home_team_id, g.home_team_name_en);
    const tB = teamFromGame(teams, g.away_team_id, g.away_team_name_en);
    if (tA) m.teamA = tA;
    if (tB) m.teamB = tB;
    if (m.status !== 'scheduled') {
      m.scoreA = parseScore(g.home_score);
      m.scoreB = parseScore(g.away_score);
      // Penalty scores decide a finished knockout tie.
      m.penA = parseScore(g.home_penalty_score);
      m.penB = parseScore(g.away_penalty_score);
    }
    if (s.level === 1) {
      leaves[s.index * 2] = tA;
      leaves[s.index * 2 + 1] = tB;
    }
  }

  // Need a fully-seeded Round of 32 before the bracket is meaningful.
  const seeded = leaves.filter(Boolean).length;
  if (seeded < 32) return null;

  return resolveBracket(leaves, matches);
}

/**
 * Fetch the live World Cup 2026 knockout bracket. Returns null when the Round of
 * 32 isn't fully drawn yet (group stage still running), so the caller falls back
 * to sample data.
 */
export async function fetchLiveBracket(): Promise<BracketState | null> {
  const [teams, gamesResp] = await Promise.all([
    getTeams(),
    getJson<{ games: ApiGame[] }>('/get/games'),
  ]);
  if (!gamesResp?.games?.length) return null;
  return buildBracket(gamesResp.games, teams);
}
