# League Bot

League Bot is a simple Discord bot designed to interact with users and provide functionality related to League of Legends. Follow the instructions below to set up and run the bot. You can run bot with cron on server to get latest games played by your friends.

## Prerequisites

Before you start, ensure you have the following:

1. **Discord Token**: Obtain a bot token from the Discord Developer Portal.
2. **Discord Channel ID**: Identify the channel ID where the bot will operate.
3. **Riot Client Token**: Acquire an API token from Riot Games to interact with their services.
4. **User Information**: Populate the `people.json` file with user details.

## Setup Instructions

1. Clone this repository:

   ```bash
   git clone https://github.com/D0dii/league-bot.git
   cd league-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the bot:

   - Open the `people.json` file and add user information in the following format:
     ```json
     [
       {
         "username": "User1",
         "tag": "eune",
         "game": "lol"
       },
       {
         "username": "User2",
         "tag": "eune",
         "game": "lol"
       }
     ]
     ```

4. Set environment variables:

   ```bash
   export DISCORD_TOKEN="your-discord-token"
   export DISCORD_CHANNEL_ID="your-channel-id"
   export RITO_CLIENT_TOKEN="your-riot-client-token"
   ```

5. Run the bot:
   ```bash
   npm run bot
   ```

## Usage

Once the bot is running, it will:

- Interact with users in the specified Discord channel.
- Use the Riot API to fetch League of Legends data.

## Notes

- Ensure your Riot API token is valid and has sufficient permissions.
- Keep your `people.json` file updated with accurate user information.

## License

This project is licensed under the MIT License.
