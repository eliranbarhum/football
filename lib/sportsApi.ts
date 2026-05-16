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
}

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strBadge: string;
  strLogo: string;
  strFanart1: string;
}

const playerCache: Record<string, SportsDBPlayer | null> = {};
const teamCache: Record<string, SportsDBTeam | null> = {};

export async function searchPlayer(name: string): Promise<SportsDBPlayer | null> {
  if (playerCache[name] !== undefined) return playerCache[name];
  try {
    const response = await fetch(
      `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(name)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) { playerCache[name] = null; return null; }
    const data = await response.json();
    const player: SportsDBPlayer | null = data?.player?.[0] ?? null;
    playerCache[name] = player;
    return player;
  } catch {
    playerCache[name] = null;
    return null;
  }
}

export async function searchTeam(name: string): Promise<SportsDBTeam | null> {
  if (teamCache[name] !== undefined) return teamCache[name];
  try {
    const response = await fetch(
      `${BASE_URL}/searchteams.php?t=${encodeURIComponent(name)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) { teamCache[name] = null; return null; }
    const data = await response.json();
    const team: SportsDBTeam | null = data?.teams?.[0] ?? null;
    teamCache[name] = team;
    return team;
  } catch {
    teamCache[name] = null;
    return null;
  }
}

export async function getTeamBadge(teamName: string): Promise<string | null> {
  const team = await searchTeam(teamName);
  return team?.strBadge ?? null;
}

export async function getPlayerImage(playerName: string): Promise<string | null> {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  return player.strCutout || player.strThumb || player.strRender || null;
}

export async function getPlayerFanart(playerName: string): Promise<string | null> {
  const player = await searchPlayer(playerName);
  if (!player) return null;
  return player.strFanart1 || player.strFanart2 || player.strFanart3 || player.strFanart4 || player.strBanner || player.strThumb || null;
}

export async function batchFetchPlayers(
  names: string[]
): Promise<Record<string, SportsDBPlayer | null>> {
  const results: Record<string, SportsDBPlayer | null> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < names.length; i += 5) chunks.push(names.slice(i, i + 5));
  for (const chunk of chunks) {
    await Promise.all(chunk.map((name) => searchPlayer(name).then((p) => { results[name] = p; })));
    await new Promise((r) => setTimeout(r, 200));
  }
  return results;
}
