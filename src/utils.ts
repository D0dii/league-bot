import { TextChannel } from "discord.js";
import { getUser, storeUser, updateUserLastMatchId } from "./db";

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

export const notifyAboutLastUserMatch = async (
  username: string,
  tag: string,
  token: string,
  channel: TextChannel
) => {
  let user = await getUser(username);
  let userPuuid: string;
  let lastMatchIdFromDb: string | null = null;
  if (user) {
    userPuuid = user.puuid;
    lastMatchIdFromDb = user.lastMatchId;
  } else {
    userPuuid = await getUserPuuid(username, tag, token);
    await storeUser(username, userPuuid, "");
  }

  const currentMatchId = await getLastMatchId(userPuuid, token);

  if (currentMatchId !== lastMatchIdFromDb) {
    const matchDetails = await getMatchDetails(currentMatchId, token);
    const player = matchDetails.info.participants.find((p: any) => p.puuid === userPuuid);
    await channel.send(
      `${player.riotIdGameName} zagrał ${matchDetails.info.gameMode}, ${
        player.win ? "wygrał" : "przegrał"
      }, miał ${player.kills} zabójstw i ${player.deaths} śmierci, grał ${player.championName}`
    );
    await updateUserLastMatchId(username, currentMatchId);
  } else {
    console.log(`No new match for ${username}`);
  }
};
