import { useState, useEffect, useCallback, useRef } from 'react';
import { getPlayerImage, getPlayerFanart } from '../lib/sportsApi';
import { PLAYERS, Player } from '../constants/players';

export interface PlayerImageData {
  playerId: string;
  thumbUrl: string | null;
  fanartUrl: string | null;
  loading: boolean;
  error: boolean;
}

const imageCache: Record<string, { thumbUrl: string | null; fanartUrl: string | null }> = {};

export function usePlayerImages(players: Player[]) {
  const [images, setImages] = useState<Record<string, PlayerImageData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const fetchImages = useCallback(async () => {
    abortRef.current = false;
    setLoading(true);
    setError(null);

    const initialState: Record<string, PlayerImageData> = {};
    players.forEach((p) => {
      initialState[p.id] = {
        playerId: p.id,
        thumbUrl: imageCache[p.searchName]?.thumbUrl ?? null,
        fanartUrl: imageCache[p.searchName]?.fanartUrl ?? null,
        loading: !imageCache[p.searchName],
        error: false,
      };
    });
    setImages(initialState);

    // First: resolve players with directImageUrl immediately (no API call)
    const withDirect = players.filter((p) => p.directImageUrl);
    withDirect.forEach((player) => {
      imageCache[player.searchName] = {
        thumbUrl: player.directImageUrl!,
        fanartUrl: null,
      };
      setImages((prev) => ({
        ...prev,
        [player.id]: {
          playerId: player.id,
          thumbUrl: player.directImageUrl!,
          fanartUrl: null,
          loading: false,
          error: false,
        },
      }));
    });

    const uncached = players.filter(
      (p) => !p.directImageUrl && !imageCache[p.searchName]
    );

    const chunks: Player[][] = [];
    for (let i = 0; i < uncached.length; i += 4) {
      chunks.push(uncached.slice(i, i + 4));
    }

    for (const chunk of chunks) {
      if (abortRef.current) break;

      await Promise.all(
        chunk.map(async (player) => {
          try {
            const [thumbUrl, fanartUrl] = await Promise.all([
              getPlayerImage(player.searchName),
              getPlayerFanart(player.searchName),
            ]);

            imageCache[player.searchName] = { thumbUrl, fanartUrl };

            if (!abortRef.current) {
              setImages((prev) => ({
                ...prev,
                [player.id]: {
                  playerId: player.id,
                  thumbUrl,
                  fanartUrl,
                  loading: false,
                  error: false,
                },
              }));
            }
          } catch {
            if (!abortRef.current) {
              setImages((prev) => ({
                ...prev,
                [player.id]: {
                  playerId: player.id,
                  thumbUrl: null,
                  fanartUrl: null,
                  loading: false,
                  error: true,
                },
              }));
            }
          }
        })
      );

      // Small rate-limit pause between chunks
      if (!abortRef.current) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    if (!abortRef.current) {
      setLoading(false);
    }
  }, [players]);

  useEffect(() => {
    fetchImages();
    return () => {
      abortRef.current = true;
    };
  }, [fetchImages]);

  return { images, loading, error, refetch: fetchImages };
}

export function useSinglePlayerImage(player: Player | null) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [fanartUrl, setFanartUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!player) return;

    // Use directImageUrl immediately — no API call needed
    if (player.directImageUrl) {
      imageCache[player.searchName] = { thumbUrl: player.directImageUrl, fanartUrl: null };
      setThumbUrl(player.directImageUrl);
      setFanartUrl(null);
      setLoading(false);
      return;
    }

    if (imageCache[player.searchName]) {
      setThumbUrl(imageCache[player.searchName].thumbUrl);
      setFanartUrl(imageCache[player.searchName].fanartUrl);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      getPlayerImage(player.searchName),
      getPlayerFanart(player.searchName),
    ])
      .then(([thumb, fanart]) => {
        imageCache[player.searchName] = { thumbUrl: thumb, fanartUrl: fanart };
        if (!cancelled) {
          setThumbUrl(thumb);
          setFanartUrl(fanart);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [player]);

  return { thumbUrl, fanartUrl, loading, error };
}
