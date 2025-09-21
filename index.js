// index.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { startRenderer, stopRenderer } = require('./renderer/renderer-starter');
const { getConfig } = require('./utils/db');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();
// load commands (for local command execute map)
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

// events: slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('Command error', err);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Error executing command', ephemeral: true });
    }
  }
});

// handle member join by separate event module
client.on('guildMemberAdd', async (member) => {
  try {
    const cfg = await getConfig(member.guild.id);
    if (!cfg.welcome_channel) return;
    const channel = await member.guild.channels.fetch(cfg.welcome_channel).catch(() => null);
    if (!channel) return;
    // Use event helper
    const handler = require('./events/guildMemberAdd');
    await handler(member, cfg);
  } catch (e) {
    console.error('guildMemberAdd handler error', e);
  }
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await startRenderer(); // init renderer
});

// graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT - shutting down');
  await stopRenderer();
  client.destroy();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('SIGTERM - shutting down');
  await stopRenderer();
  client.destroy();
  process.exit(0);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}
client.login(token);
