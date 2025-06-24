import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { validateJsonFile } from "./utils";
import { setupDb } from "./db";
import {
  handleMatchesCommand,
  registerLastThreeMatchesCommand,
} from "./utils/registerLastThreeMatchesCommand";
import { notifyUsers } from "./utils/notifyUsersAboutMatch";

const main = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  const riotToken = process.env.RIOT_TOKEN ?? "";
  const channelId = process.env.CHANNEL_ID ?? "";
  const guildId = process.env.GUILD_ID ?? "";
  const discordToken = process.env.DISCORD_TOKEN ?? "";

  const fileValidationResult = await validateJsonFile("people.json");

  if (fileValidationResult.status !== "success") {
    console.log(fileValidationResult.message);
    return;
  }

  client.once("ready", async () => {
    console.log(`Zalogowano jako ${client.user?.tag}`);

    await setupDb();
    await registerLastThreeMatchesCommand(fileValidationResult.result, discordToken, guildId, client);
    setInterval(() => notifyUsers(fileValidationResult.result, client, channelId, riotToken), 5 * 60 * 1000);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "matches") {
      const reply = await handleMatchesCommand(interaction, riotToken, fileValidationResult.result);
      await interaction.reply(reply);
    }
  });

  client.login(discordToken);
};

main();
