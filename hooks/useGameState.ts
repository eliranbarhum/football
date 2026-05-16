import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@football_stars_game';

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

export interface GameState {
  onboardingDone: boolean;
  favoriteTeam: string | null;
  playerProgress: Record<string, PlayerProgress>;
  coins: number;
  matchStats: MatchStats;
}

const DEFAULT_STATE: GameState = {
  onboardingDone: false,
  favoriteTeam: null,
  playerProgress: {},
  coins: 0,
  matchStats: { wins: 0, losses: 0, draws: 0 },
};

export function useGameState() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
        } catch {
          setState(DEFAULT_STATE);
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((next: GameState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const completeOnboarding = useCallback((team: string) => {
    save({ ...state, onboardingDone: true, favoriteTeam: team });
  }, [state, save]);

  const answerQuestion = useCallback(
    (playerId: string, questionIndex: number, correct: boolean) => {
      const prev = state.playerProgress[playerId] ?? {
        correctAnswers: 0,
        unlocked: false,
        answeredIndices: [],
      };

      if (prev.answeredIndices.includes(questionIndex)) return;

      const newCorrect = prev.correctAnswers + (correct ? 1 : 0);
      const newAnswered = [...prev.answeredIndices, questionIndex];
      const unlocked = newCorrect >= 4;

      const next: GameState = {
        ...state,
        playerProgress: {
          ...state.playerProgress,
          [playerId]: {
            correctAnswers: newCorrect,
            unlocked,
            answeredIndices: newAnswered,
          },
        },
      };
      save(next);
    },
    [state, save]
  );

  const addCoins = useCallback(
    (amount: number) => {
      save({ ...state, coins: state.coins + amount });
    },
    [state, save]
  );

  const recordMatch = useCallback(
    (result: 'win' | 'loss' | 'draw', coinsEarned: number) => {
      const ms = state.matchStats;
      save({
        ...state,
        coins: state.coins + coinsEarned,
        matchStats: {
          wins: ms.wins + (result === 'win' ? 1 : 0),
          losses: ms.losses + (result === 'loss' ? 1 : 0),
          draws: ms.draws + (result === 'draw' ? 1 : 0),
        },
      });
    },
    [state, save]
  );

  const getUnlockedPlayers = useCallback(() => {
    return Object.entries(state.playerProgress)
      .filter(([, p]) => p.unlocked)
      .map(([id]) => id);
  }, [state.playerProgress]);

  const getPlayerProgress = useCallback(
    (playerId: string): PlayerProgress => {
      return (
        state.playerProgress[playerId] ?? {
          correctAnswers: 0,
          unlocked: false,
          answeredIndices: [],
        }
      );
    },
    [state.playerProgress]
  );

  return {
    state,
    loaded,
    completeOnboarding,
    answerQuestion,
    addCoins,
    recordMatch,
    getUnlockedPlayers,
    getPlayerProgress,
  };
}
