const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

export interface SportsDBPlayer {
  idPlayer: string;
  strPlayer: string;
  strTeam: string;
  strNationality: string;
  strPosition: string;
  strThumb: string;
  strCutout: string;
  strRender: string;
  strBanner: string;
  strFanart1: string;
  strFanart2: string;
  strFanart3: string;
  strFanart4: string;
  strDescriptionEN: string;
  intBirthYear: string;
  strBirthLocation: string;
  strNumber: string;
  strSigning: string;
  strWage: string;
}

const cache: Record<string, SportsDBPlayer | null> = {};

export async function searchPlayer(name: string): Promise<SportsDBPlayer | null> {
  if (cache[name] !== undefined) {
    return cache[name];
  }

  try {
    const encoded = encodeURIComponent(name);
    const response = await fetch(`${BASE_URL}/searchplayers.php?p=${encoded}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`SportsDB API error for "${name}": ${response.status}`);
      cache[name] = null;
      return null;
    }

    const data = await response.json();
    const player: SportsDBPlayer | null = data?.player?.[0] ?? null;
    cache[name] = player;
    return player;
  } catch (error) {
    console.warn(`Failed to fetch player "${name}":`, error);
    cache[name] = null;
    return null;
  }
}

export async function getPlayerImage(playerName: string): Promise<string | null> {
  const player = await searchPlayer(playerName);
  if (!player) return null;

  // Prefer cutout, then thumb, then render
  return player.strCutout || player.strThumb || player.strRender || null;
}

export async function getPlayerFanart(playerName: string): Promise<string | null> {
  const player = await searchPlayer(playerName);
  if (!player) return null;

  return (
    player.strFanart1 ||
    player.strFanart2 ||
    player.strFanart3 ||
    player.strFanart4 ||
    player.strBanner ||
    player.strThumb ||
    null
  );
}

export async function batchFetchPlayers(
  names: string[]
): Promise<Record<string, SportsDBPlayer | null>> {
  const results: Record<string, SportsDBPlayer | null> = {};

  // Fetch concurrently but limit to 5 at a time
  const chunks: string[][] = [];
  for (let i = 0; i < names.length; i += 5) {
    chunks.push(names.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const fetches = chunk.map((name) =>
      searchPlayer(name).then((player) => {
        results[name] = player;
      })
    );
    await Promise.all(fetches);
    // Small delay to be respectful of the free API
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}
