import { Client, GatewayIntentBits, TextChannel, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import "dotenv/config";
import { notifyAboutLastUserMatch, validateJsonFile } from "./utils";
import { setupDb } from "./db";
import fs from "fs/promises"; 
import { userSchema } from "./types"; 
import { generateMessageToChannel } from "./lol/utils"; 
import { getUserPuuid, storeUser } from "./utils"; 
import { getUser, storeUser as dbStoreUser, updateUserLastMatchId } from "./db"; 
import { getLastMatchId, getMatchDetails } from "./lol/utils";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const ritoToken = process.env.RIOT_TOKEN ?? "";
const channelId = process.env.CHANNEL_ID ?? "";
const guildId = process.env.GUILD_ID ?? ""; 

async function registerSlashCommand() {
  const fileValidationResult = await validateJsonFile("people.json");
  if (fileValidationResult.status !== "success") return;

  const choices = fileValidationResult.result.map((user) => ({
    name: user.username,
    value: user.username,
  }));

  const command = new SlashCommandBuilder()
    .setName("matches")
    .setDescription("Pokaż ostatnie 3 mecze wybranego gracza")
    .addStringOption(option =>
      option
        .setName("user")
        .setDescription("Wybierz gracza")
        .setRequired(true)
        .addChoices(...choices)
    );

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN ?? "");
  await rest.put(
    guildId
      ? Routes.applicationGuildCommands(client.user!.id, guildId)
      : Routes.applicationCommands(client.user!.id),
    { body: [command.toJSON()] }
  );
}

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user?.tag}`);
  await registerSlashCommand();
  await setupDb();

});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "matches") {
    const username = interaction.options.getString("user", true);

    
    const fileValidationResult = await validateJsonFile("people.json");
    if (fileValidationResult.status !== "success") {
      await interaction.reply("Błąd podczas wczytywania użytkowników.");
      return;
    }
    const user = fileValidationResult.result.find(u => u.username === username);
    if (!user) {
      await interaction.reply("Nie znaleziono użytkownika.");
      return;
    }

    
    const dbUser = await (await import("./db")).getUser(user.username);
    let puuid = dbUser?.puuid;
    if (!puuid) {
      
      const { getUserPuuid, storeUser } = await import("./utils");
      puuid = await getUserPuuid(user.username, user.tag, ritoToken);
      await storeUser(user.username, puuid, "");
    }

    
    const url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=3`;
    const res = await fetch(url, { headers: { "X-Riot-Token": ritoToken } });
    if (!res.ok) {
      await interaction.reply("Nie udało się pobrać meczów.");
      return;
    }
    const matchIds: string[] = await res.json();
    if (!matchIds.length) {
      await interaction.reply("Brak meczów.");
      return;
    }

    let reply = `Ostatnie 3 mecze gracza **${user.username}**:\n`;
    for (const matchId of matchIds) {
      const match = await getMatchDetails(matchId, ritoToken);
      const player = match.info.participants.find((p: any) => p.puuid === puuid);
      if (player) {
        
        const timestamp = match.info.gameStartTimestamp;
        const date = new Date(timestamp);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear().toString().slice(-2)}`;
        reply += `• ${match.info.gameMode} | ${player.championName} | K/D/A: ${player.kills}/${player.deaths}/${player.assists} | ${player.win ? "Wygrana" : "Przegrana"} | ${formattedDate}\n`;
      }
    }
    await interaction.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);