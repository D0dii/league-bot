export const getUserPuuid = async (username: string, tag: string, token: string) => {
  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    username
  )}/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono gracza");
  const data = await res.json();
  return data.puuid;
};

export const getLastMatchId = async (puuid: string, token: string) => {
  const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono meczów");
  const data = await res.json();
  return data[0];
};

export const getMatchDetails = async (matchId: string, token: string) => {
  const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono szczegółów meczu");
  return await res.json();
};
