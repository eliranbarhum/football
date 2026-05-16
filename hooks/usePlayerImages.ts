import { useMemo } from 'react';
import { Player } from '../constants/players';

export interface PlayerImageData {
  playerId: string;
  thumbUrl: string | null;
  fanartUrl: string | null;
  loading: boolean;
  error: boolean;
}

// All players now have directImageUrl — no API calls needed
export function usePlayerImages(players: Player[]) {
  const images = useMemo(() => {
    const result: Record<string, PlayerImageData> = {};
    players.forEach((p) => {
      result[p.id] = {
        playerId: p.id,
        thumbUrl: p.directImageUrl ?? null,
        fanartUrl: null,
        loading: false,
        error: false,
      };
    });
    return result;
  }, [players]);

  return { images, loading: false, error: null, refetch: () => {} };
}

export function useSinglePlayerImage(player: Player | null) {
  return {
    thumbUrl: player?.directImageUrl ?? null,
    fanartUrl: null,
    loading: false,
    error: false,
  };
}
