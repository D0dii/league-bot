import { TextChannel } from "discord.js";
import { getUser, storeUser as dbStoreUser, updateUserLastMatchId } from "./db";
import fs from "fs/promises";
import { generateMessageToChannel, getLastMatchId, getMatchDetails } from "./lol/utils";
import z from "zod";
import { FileValidateResult, userSchema } from "./types";

export const getUserPuuid = async (username: string, tag: string, token: string) => {
  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    username
  )}/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono gracza");
  const data = await res.json();
  return data.puuid;
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

    const message = generateMessageToChannel(player.kills, player.assists, player.kills, player.win);
    await channel.send(
      `${player.riotIdGameName} zagrał grę ${matchDetails.info.gameMode} i miał ${message}, trollował ${player.championName} w grze?`
    );

    await updateUserLastMatchId(username, currentMatchId);
  } else {
    console.log(`No new match for ${username}`);
  }
};

export const validateJsonFile = async (filePath: string): Promise<FileValidateResult> => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);

    const result = z.array(userSchema).parse(parsed);
    return { status: "success", result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("❌ Validation errors:", err.errors);
      return { status: "failed", message: "zod error" };
    } else {
      return { status: "failed", message: "file error" };
    }
  }
};

export async function storeUser(username: string, puuid: string, tag: string) {
 
  const existingUser = await getUser(username);
  if (existingUser) {
   
    await dbStoreUser(username, puuid, tag);
    return;
  }
  
  await dbStoreUser(username, puuid, tag);
  console.log(`User ${username} stored with PUUID: ${puuid}`);
  return { username, puuid, tag };

}

