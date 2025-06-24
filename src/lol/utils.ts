import { ChatInputCommandInteraction } from "discord.js";
import { getUser, storeUser } from "../db";
import { User } from "../types";
import { getUserPuuid } from "../utils";

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
  const kda = Number(((kills + assists) / Math.max(deaths, 1)).toFixed(2));
  if (kda > 1 && isWon) {
    return `kda na plus równe ${kda}, a do tego wygrana`;
  } else if (kda > 1 && !isWon) {
    return `kda dobre: ${kda}, ale team nie pomógł i przejebał`;
  } else {
    return `kda do dupy: ${kda}${isWon ? ", ale wygrał na farcie" : " i do tego przegrana"}`;
  }
};

export const getLastThreeUserMatches = async (user: User, ritoToken: string) => {
  let dbUser = await getUser(user.username, user.tag);
  let puuid = dbUser?.puuid;
  if (!puuid) {
    puuid = await getUserPuuid(user.username, user.tag, ritoToken);
    await storeUser(user.username, puuid, user.tag);
  }

  const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=3`;
  const res = await fetch(url, { headers: { "X-Riot-Token": ritoToken } });
  if (!res.ok) {
    return "Nie udało się pobrać meczów.";
  }
  const matchIds: string[] = await res.json();
  if (!matchIds.length) {
    return "Brak meczów";
  }

  let reply = `Ostatnie 3 mecze gracza **${user.username}**:\n`;
  for (const matchId of matchIds) {
    const match = await getMatchDetails(matchId, ritoToken);
    const player = match.info.participants.find((p: any) => p.puuid === puuid);
    if (player) {
      const timestamp = match.info.gameStartTimestamp;
      const date = new Date(timestamp);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${date.getFullYear().toString().slice(-2)}`;
      reply += `• ${match.info.gameMode} | ${player.championName} | K/D/A: ${player.kills}/${player.deaths}/${
        player.assists
      } | ${player.win ? "Wygrana" : "Przegrana"} | ${formattedDate}\n`;
    }
  }
  return reply;
};
