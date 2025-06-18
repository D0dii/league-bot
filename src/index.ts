import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import "dotenv/config";
import { notifyAboutLastUserMatch, validateJsonFile } from "./utils";
import { setupDb } from "./db";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const ritoToken = process.env.RIOT_TOKEN ?? "";
const channelId = process.env.CHANNEL_ID ?? "";
client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user?.tag}`);

  const fileValidationResult = await validateJsonFile("people.json");

  if (fileValidationResult.status === "success") {
    const channel = await client.channels.fetch(channelId);
    const db = await setupDb();

    if (channel && channel instanceof TextChannel) {
      for (const user of fileValidationResult.result) {
        if (user.game === "lol") {
          await notifyAboutLastUserMatch(user.username, user.tag, ritoToken, channel);
        }
      }

      process.exit(0);
    }
  } else {
    console.log(fileValidationResult.message);
    process.exit(0);
  }
});

client.login(process.env.DISCORD_TOKEN);
