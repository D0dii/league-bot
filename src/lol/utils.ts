export const getLastMatchId = async (puuid: string, token: string) => {
  const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Matches for league not found");
  const data = await res.json();
  return data[0];
};

export const getMatchDetails = async (matchId: string, token: string) => {
  const url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Match details for league not found");
  return await res.json();
};

export const generateMessageToChannel = (kills: number, assists: number, deaths: number, isWon: boolean) => {
  const kda = (kills + assists) / deaths;
  if (kda > 1 && isWon) {
    return `kda na plus równe ${kda}, a do tego wygrana`;
  } else if (kda > 1 && !isWon) {
    return `kda dobre: ${kda}, ale team nie pomógł i przejebał`;
  } else {
    return `kda do dupy: ${kda}${isWon ? ", ale wygrał na farcie" : " i do tego przegrana"}`;
  }
};
