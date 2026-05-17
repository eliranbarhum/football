import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlayerById, PLAYERS } from '../constants/players';
import { DEV_FLAGS } from '../constants/featureFlags';

const STORAGE_KEY = '@football_stars_game';
const APP_DATA_VERSION = 5;
const USER_TEAM_NAME = 'ברהום';
const SEASON_LEGS = 2; // Home and Away

const LEAGUE_OPPONENTS = [
  'Real Madrid',
  'Barcelona',
  'Manchester City',
  'Liverpool',
  'Arsenal',
  'Bayern Munich',
  'Inter Milan',
  'Juventus',
  'PSG',
];

export interface PlayerProgress {
  correctAnswers: number;
  unlocked: boolean;
  answeredIndices: number[];
}

export interface MatchStats {
  wins: number;
  losses: number;
  draws: number;
}

export type LineupSlot =
  | 'gk'
  | 'cb1'
  | 'cb2'
  | 'lb'
  | 'rb'
  | 'cm1'
  | 'cm2'
  | 'cm3'
  | 'lw'
  | 'rw'
  | 'st';

export type Lineup = Record<LineupSlot, string | null>;

export interface Fixture {
  home: string;
  away: string;
  played: boolean;
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface Round {
  round: number;
  fixtures: Fixture[];
}

export interface LeagueRow {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface GameState {
  appDataVersion: number;
  onboardingDone: boolean;
  favoriteTeam: string | null;
  playerProgress: Record<string, PlayerProgress>;
  lineup: Lineup;
  seasonRounds: Round[];
  currentRound: number;
  leagueTable: LeagueRow[];
  coins: number;
  matchStats: MatchStats;
  aiGenerations: {
    count: number;
    lastReset: number;
  };
  streak: {
    current: number;
    best: number;
    lastPlayedDate: string; // 'YYYY-MM-DD'
  };
}

const DEFAULT_LINEUP: Lineup = {
  gk: null,
  cb1: null,
  cb2: null,
  lb: null,
  rb: null,
  cm1: null,
  cm2: null,
  cm3: null,
  lw: null,
  rw: null,
  st: null,
};

function allLeagueTeams() {
  return [USER_TEAM_NAME, ...LEAGUE_OPPONENTS];
}

function createLeagueTable(): LeagueRow[] {
  return allLeagueTeams().map((team) => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
  }));
}

function createSeasonRounds(): Round[] {
  const teams = [...allLeagueTeams()];
  if (teams.length % 2 !== 0) teams.push('__BYE__');

  const n = teams.length;
  const singleLegRounds: Round[] = [];
  const arr = [...teams];

  // Round-robin algorithm
  for (let r = 0; r < n - 1; r += 1) {
    const fixtures: Fixture[] = [];
    for (let i = 0; i < n / 2; i += 1) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== '__BYE__' && away !== '__BYE__') {
        fixtures.push({
          home: r % 2 === 0 ? home : away,
          away: r % 2 === 0 ? away : home,
          played: false,
          homeGoals: null,
          awayGoals: null,
        });
      }
    }
    singleLegRounds.push({ round: r + 1, fixtures });

    const fixed = arr[0];
    const rotated = [fixed, arr[n - 1], ...arr.slice(1, n - 1)];
    for (let i = 0; i < n; i += 1) arr[i] = rotated[i];
  }

  // Multiply by legs
  const allRounds: Round[] = [];
  for (let leg = 0; leg < SEASON_LEGS; leg++) {
    singleLegRounds.forEach((r) => {
      const roundNum = leg * (n - 1) + r.round;
      const fixtures = r.fixtures.map((f) => ({
        ...f,
        // Swap home/away for even legs to simulate home/away balance
        home: leg % 2 === 1 ? f.away : f.home,
        away: leg % 2 === 1 ? f.home : f.away,
      }));
      allRounds.push({ round: roundNum, fixtures });
    });
  }

  return allRounds;
}

const DEFAULT_STATE: GameState = {
  appDataVersion: APP_DATA_VERSION,
  onboardingDone: false,
  favoriteTeam: null,
  playerProgress: {},
  lineup: DEFAULT_LINEUP,
  seasonRounds: createSeasonRounds(),
  currentRound: 0,
  leagueTable: createLeagueTable(),
  coins: 0,
  matchStats: { wins: 0, losses: 0, draws: 0 },
  aiGenerations: {
    count: 0,
    lastReset: Date.now(),
  },
  streak: {
    current: 0,
    best: 0,
    lastPlayedDate: '',
  },
};

function computeLineupStrength(lineup: Lineup) {
  let score = 50;
  const ids = Object.values(lineup).filter((v): v is string => Boolean(v));
  score += ids.length * 3;

  ids.forEach((id) => {
    const player = getPlayerById(id);
    if (!player) return;
    if (player.isFeatured) score += 3;
    if (player.isPopular) score += 2;
  });

  return Math.max(45, Math.min(95, score));
}

function teamBaseStrength(team: string) {
  const map: Record<string, number> = {
    'Real Madrid': 86,
    Barcelona: 84,
    'Manchester City': 88,
    Liverpool: 83,
    Arsenal: 82,
    'Bayern Munich': 85,
    'Inter Milan': 81,
    Juventus: 80,
    PSG: 84,
    [USER_TEAM_NAME]: 74,
  };
  return map[team] ?? 78;
}

function sampleGoals(expected: number) {
  const r = Math.random();
  if (r < 0.12) return 0;
  if (r < 0.38) return 1;
  if (r < 0.68) return 2;
  if (r < 0.88) return 3;
  return expected > 2.25 ? 4 : 3;
}

function simulateScore(homeStrength: number, awayStrength: number) {
  const homeExp = 1.35 + (homeStrength - awayStrength) / 42;
  const awayExp = 1.1 + (awayStrength - homeStrength) / 45;

  let homeGoals = sampleGoals(homeExp);
  let awayGoals = sampleGoals(awayExp);

  if (Math.abs(homeStrength - awayStrength) > 10 && homeGoals === awayGoals) {
    if (homeStrength > awayStrength) homeGoals += 1;
    else awayGoals += 1;
  }

  return { homeGoals, awayGoals };
}

function sortTable(rows: LeagueRow[]) {
  return [...rows].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });
}

function applyResult(rows: LeagueRow[], home: string, away: string, homeGoals: number, awayGoals: number) {
  const next = rows.map((r) => ({ ...r }));
  const h = next.find((r) => r.team === home);
  const a = next.find((r) => r.team === away);
  if (!h || !a) return next;

  h.played += 1;
  a.played += 1;
  h.gf += homeGoals;
  h.ga += awayGoals;
  a.gf += awayGoals;
  a.ga += homeGoals;

  if (homeGoals > awayGoals) {
    h.wins += 1;
    a.losses += 1;
    h.pts += 3;
  } else if (homeGoals < awayGoals) {
    a.wins += 1;
    h.losses += 1;
    a.pts += 3;
  } else {
    h.draws += 1;
    a.draws += 1;
    h.pts += 1;
    a.pts += 1;
  }

  h.gd = h.gf - h.ga;
  a.gd = a.gf - a.ga;

  return sortTable(next);
}

export function useGameState() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const next =
            parsed.appDataVersion === APP_DATA_VERSION
              ? { ...DEFAULT_STATE, ...parsed }
              : DEFAULT_STATE;
          setState(next);
        } catch {
          setState(DEFAULT_STATE);
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: GameState) => {
    const normalized = { ...next, appDataVersion: APP_DATA_VERSION };
    setState(normalized);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const completeOnboarding = useCallback((team: string) => {
    save({ ...state, onboardingDone: true, favoriteTeam: team });
  }, [state, save]);

  const answerQuestion = useCallback((playerId: string, questionIndex: number, correct: boolean) => {
    if (!correct) return;
    const prev = state.playerProgress[playerId] ?? { correctAnswers: 0, unlocked: false, answeredIndices: [] };
    if (prev.answeredIndices.includes(questionIndex)) return;

    const newCorrect = prev.correctAnswers + 1;

    // Update streak
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastPlayed = state.streak?.lastPlayedDate ?? '';
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const prevStreak = state.streak?.current ?? 0;
    const prevBest = state.streak?.best ?? 0;
    let newStreak = prevStreak;
    if (lastPlayed === todayStr) {
      // Already played today — streak unchanged
      newStreak = prevStreak;
    } else if (lastPlayed === yesterday) {
      // Consecutive day
      newStreak = prevStreak + 1;
    } else {
      // Streak broken or first time
      newStreak = 1;
    }

    const next: GameState = {
      ...state,
      playerProgress: {
        ...state.playerProgress,
        [playerId]: {
          correctAnswers: newCorrect,
          unlocked: newCorrect >= 4,
          answeredIndices: [...prev.answeredIndices, questionIndex],
        },
      },
      streak: {
        current: newStreak,
        best: Math.max(newStreak, prevBest),
        lastPlayedDate: todayStr,
      },
    };
    save(next);
  }, [state, save]);

  const getUnlockedPlayers = useCallback(() => {
    // שחקנים עם alwaysUnlocked פתוחים תמיד — בכל מצב
    const alwaysUnlockedIds = PLAYERS
      .filter((p) => p.alwaysUnlocked)
      .map((p) => p.id);

    if (__DEV__ && DEV_FLAGS.UNLOCK_21_PLAYERS_FOR_TESTS) {
      const wanted = Math.max(40, DEV_FLAGS.QA_UNLOCKED_PLAYERS_COUNT);
      const byRole = [
        ...PLAYERS.filter((p) => p.position === 'Goalkeeper'),
        ...PLAYERS.filter((p) => p.position === 'Defender'),
        ...PLAYERS.filter((p) => p.position === 'Midfielder'),
        ...PLAYERS.filter((p) => p.position === 'Forward'),
      ];
      const unique = Array.from(new Map(byRole.map((p) => [p.id, p])).values());
      const devIds = unique.slice(0, wanted).map((p) => p.id);
      return Array.from(new Set([...devIds, ...alwaysUnlockedIds]));
    }

    const progressIds = Object.entries(state.playerProgress)
      .filter(([, p]) => p.unlocked)
      .map(([id]) => id);

    return Array.from(new Set([...progressIds, ...alwaysUnlockedIds]));
  }, [state.playerProgress]);

  const getPlayerProgress = useCallback((playerId: string): PlayerProgress => {
    return state.playerProgress[playerId] ?? { correctAnswers: 0, unlocked: false, answeredIndices: [] };
  }, [state.playerProgress]);

  const saveLineup = useCallback((lineup: Lineup) => {
    save({ ...state, lineup });
  }, [state, save]);

  const playNextRound = useCallback(() => {
    if (state.currentRound >= state.seasonRounds.length) {
      return { ok: false as const, reason: 'season_finished' as const };
    }

    const filledSlots = Object.values(state.lineup).filter(Boolean).length;
    if (filledSlots < 11) {
      return { ok: false as const, reason: 'lineup_incomplete' as const };
    }

    const rounds = state.seasonRounds.map((r) => ({ ...r, fixtures: r.fixtures.map((f) => ({ ...f })) }));
    const current = rounds[state.currentRound];
    let table = state.leagueTable;

    let userMatchSummary: {
      opponent: string;
      round: number;
      goalsFor: number;
      goalsAgainst: number;
      result: 'win' | 'draw' | 'loss';
      coins: number;
    } = {
      opponent: '',
      round: current.round,
      goalsFor: 0,
      goalsAgainst: 0,
      result: 'draw',
      coins: 0,
    };
    let foundUserMatch = false;

    current.fixtures = current.fixtures.map((fx) => {
      let homeStrength = teamBaseStrength(fx.home);
      let awayStrength = teamBaseStrength(fx.away);

      if (fx.home === USER_TEAM_NAME) homeStrength = computeLineupStrength(state.lineup);
      if (fx.away === USER_TEAM_NAME) awayStrength = computeLineupStrength(state.lineup);

      const { homeGoals, awayGoals } = simulateScore(homeStrength, awayStrength);
      table = applyResult(table, fx.home, fx.away, homeGoals, awayGoals);

      if (fx.home === USER_TEAM_NAME || fx.away === USER_TEAM_NAME) {
        const goalsFor = fx.home === USER_TEAM_NAME ? homeGoals : awayGoals;
        const goalsAgainst = fx.home === USER_TEAM_NAME ? awayGoals : homeGoals;
        const result: 'win' | 'draw' | 'loss' =
          goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw';
        const coins = result === 'win' ? 30 : result === 'draw' ? 12 : 5;

        userMatchSummary = {
          opponent: fx.home === USER_TEAM_NAME ? fx.away : fx.home,
          round: current.round,
          goalsFor,
          goalsAgainst,
          result,
          coins,
        };
        foundUserMatch = true;
      }

      return { ...fx, played: true, homeGoals, awayGoals };
    });

    if (!foundUserMatch) {
      return { ok: false as const, reason: 'no_user_match' as const };
    }
    const summary = userMatchSummary;

    const ms = state.matchStats;
    const seasonFinished = state.currentRound + 1 >= state.seasonRounds.length;
    const finalPosition = table.findIndex((r) => r.team === USER_TEAM_NAME) + 1;
    const isChampion = seasonFinished && finalPosition === 1;
    const championshipBonus = isChampion ? 200 : 0;
    const nextState: GameState = {
      ...state,
      seasonRounds: rounds,
      currentRound: state.currentRound + 1,
      leagueTable: table,
      coins: state.coins + summary.coins + championshipBonus,
      matchStats: {
        wins: ms.wins + (summary.result === 'win' ? 1 : 0),
        draws: ms.draws + (summary.result === 'draw' ? 1 : 0),
        losses: ms.losses + (summary.result === 'loss' ? 1 : 0),
      },
    };

    save(nextState);
    return {
      ok: true as const,
      ...summary,
      seasonFinished,
      finalPosition,
      isChampion,
      championshipBonus,
    };
  }, [state, save]);

  const resetSeason = useCallback(() => {
    save({
      ...state,
      seasonRounds: createSeasonRounds(),
      currentRound: 0,
      leagueTable: createLeagueTable(),
      matchStats: { wins: 0, draws: 0, losses: 0 },
    });
  }, [state, save]);

  const resetGameState = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  const addCoins = useCallback((amount: number) => {
    save({ ...state, coins: state.coins + amount });
  }, [state, save]);

  const canGenerateAI = useCallback(() => {
    // In DEV mode — no limit
    if (__DEV__ && DEV_FLAGS.UNLOCK_21_PLAYERS_FOR_TESTS) return true;

    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(state.aiGenerations?.lastReset ?? 0).setHours(0, 0, 0, 0);

    if (today > lastReset) {
      return true;
    }
    return (state.aiGenerations?.count ?? 0) < 3;
  }, [state]);

  const incrementAIUsage = useCallback(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(state.aiGenerations?.lastReset ?? 0).setHours(0, 0, 0, 0);
    
    let newCount = (state.aiGenerations?.count ?? 0) + 1;
    if (today > lastReset) {
      newCount = 1;
    }
    
    save({
      ...state,
      aiGenerations: {
        count: newCount,
        lastReset: Date.now(),
      }
    });
  }, [state, save]);

  const getStreak = useCallback(() => {
    return state.streak ?? { current: 0, best: 0, lastPlayedDate: '' };
  }, [state.streak]);

  return {
    state,
    loaded,
    completeOnboarding,
    answerQuestion,
    getUnlockedPlayers,
    getPlayerProgress,
    saveLineup,
    playNextRound,
    resetSeason,
    resetGameState,
    addCoins,
    canGenerateAI,
    incrementAIUsage,
    getStreak,
  };
}
