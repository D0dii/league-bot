import { Client, GatewayIntentBits, TextChannel, REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";
import { notifyAboutLastUserMatch, validateJsonFile } from "./utils";
import { setupDb } from "./db";
import { getLastThreeUserMatches } from "./lol/utils";
import { User } from "./types";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const ritoToken = process.env.RIOT_TOKEN ?? "";
const channelId = process.env.CHANNEL_ID ?? "";
const guildId = process.env.GUILD_ID ?? "";
const discordToken = process.env.DISCORD_TOKEN ?? "";

async function registerSlashCommand(users: User[]) {
  const choices = users.map((user) => ({
    name: user.username,
    value: user.username,
  }));

  const command = new SlashCommandBuilder()
    .setName("matches")
    .setDescription("Pokaż ostatnie 3 mecze wybranego gracza")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Wybierz gracza")
        .setRequired(true)
        .addChoices(...choices)
    );

  const rest = new REST({ version: "10" }).setToken(discordToken);
  await rest.put(
    guildId
      ? Routes.applicationGuildCommands(client.user!.id, guildId)
      : Routes.applicationCommands(client.user!.id),
    { body: [command.toJSON()] }
  );
}

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user?.tag}`);
  const fileValidationResult = await validateJsonFile("people.json");
  if (fileValidationResult.status !== "success") {
    console.log(fileValidationResult.message);
    return;
  }
  await setupDb();
  await registerSlashCommand(fileValidationResult.result);
  setInterval(() => notifyUsers(fileValidationResult.result), 5 * 60 * 1000);
});

async function notifyUsers(users: User[]) {
  const channel = await client.channels.fetch(channelId);
  if (channel && channel instanceof TextChannel) {
    for (const user of users) {
      await notifyAboutLastUserMatch(user.username, user.tag, ritoToken, channel);
    }
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "matches") {
    const username = interaction.options.getString("user", true);

    const fileValidationResult = await validateJsonFile("people.json");
    if (fileValidationResult.status !== "success") {
      await interaction.reply("Błąd podczas wczytywania użytkowników.");
      return;
    }
    const user = fileValidationResult.result.find((u) => u.username === username);
    if (!user) {
      await interaction.reply("Nie znaleziono użytkownika.");
      return;
    }

    const reply = await getLastThreeUserMatches(user, ritoToken);
    await interaction.reply(reply);
  }
});

client.login(discordToken);
