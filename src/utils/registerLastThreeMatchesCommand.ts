import { ChatInputCommandInteraction, Client, REST, Routes, SlashCommandBuilder } from "discord.js";
import { User } from "../types";
import { getLastThreeUserMatches } from "../lol/utils";

export async function registerLastThreeMatchesCommand(
  users: User[],
  discordToken: string,
  guildId: string,
  client: Client
) {
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

export const handleMatchesCommand = async (
  interaction: ChatInputCommandInteraction,
  riotToken: string,
  users: User[]
) => {
  const username = interaction.options.getString("user", true);
  const user = users.find((u) => u.username === username);
  if (!user) {
    return "Nie znaleziono użytkownika.";
  }
  return await getLastThreeUserMatches(user, riotToken);
};
