import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import "dotenv/config";
import { getLastMatchId, getMatchDetails, getUserPuuid } from "./utils";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const ritoToken = process.env.RIOT_TOKEN ?? "";
const channelId = process.env.CHANNEL_ID ?? "";
client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user?.tag}`);
  const channel = await client.channels.fetch(channelId);

  if (channel && channel instanceof TextChannel) {
    const username = "Minkii";
    const tag = "EUNE";
    const userPuuid = await getUserPuuid(username, tag, ritoToken);
    const matchId = await getLastMatchId(userPuuid, ritoToken);
    const matchDetails = await getMatchDetails(matchId, ritoToken);
    const player = matchDetails.info.participants.find((p: any) => p.puuid === userPuuid);
    await channel.send(
      `Minki zagrał ${matchDetails.info.gameMode}, ${player.win ? "wygrał" : "przegrał"} miał, ${
        player.kills
      }, zabójstw i ${player.deaths} śmierci, grał ${player.championName}`
    );
    process.exit(0);
  }
});

client.login(process.env.DISCORD_TOKEN);
