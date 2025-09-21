// deploy-commands.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Registering ${commands.length} commands...`);
        if (process.env.GUILD_ID) {
            // register only to one guild (fast for testing)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log('Registered commands to guild', process.env.GUILD_ID);
        } else {
            // global (can take up to an hour)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log('Registered global commands');
        }
    } catch (err) {
        console.error('Error registering commands', err);
    }
})();
