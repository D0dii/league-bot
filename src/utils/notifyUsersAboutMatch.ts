import { Client, TextChannel } from "discord.js";
import { getUser, storeUser, updateUserLastMatchId } from "../db";
import { getUserPuuid } from "../utils";
import { generateMessageToChannel, getLastMatchId, getMatchDetails } from "../lol/utils";
import { User } from "../types";

export const notifyAboutLastUserMatch = async (
  username: string,
  tag: string,
  token: string,
  channel: TextChannel
) => {
  let user = await getUser(username, tag);
  let userPuuid: string;
  let lastMatchIdFromDb: string | null = null;
  if (user) {
    userPuuid = user.puuid;
    lastMatchIdFromDb = user.lastMatchId;
  } else {
    userPuuid = await getUserPuuid(username, tag, token);
    await storeUser(username, userPuuid, tag, "");
  }
  const currentMatchId = await getLastMatchId(userPuuid, token);

  if (currentMatchId !== lastMatchIdFromDb) {
    const matchDetails = await getMatchDetails(currentMatchId, token);
    const player = matchDetails.info.participants.find((p: any) => p.puuid === userPuuid);

    const message = generateMessageToChannel(player.kills, player.assists, player.kills, player.win);
    await channel.send(
      `${player.riotIdGameName} zagrał grę ${matchDetails.info.gameMode} i miał ${message}, trollował ${player.championName} w grze?`
    );

    await updateUserLastMatchId(username, tag, currentMatchId);
  } else {
    console.log(`No new match for ${username}`);
  }
};

export const notifyUsers = async (users: User[], client: Client, channelId: string, riotToken: string) => {
  const channel = await client.channels.fetch(channelId);
  if (channel && channel instanceof TextChannel) {
    for (const user of users) {
      await notifyAboutLastUserMatch(user.username, user.tag, riotToken, channel);
    }
  }
};
