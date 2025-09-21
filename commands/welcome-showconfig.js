// commands/welcome-showconfig.js
const { SlashCommandBuilder } = require('discord.js');
const { getConfig } = require('../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-showconfig')
        .setDescription('Show current welcome configuration for this server'),

    async execute(interaction) {
        const cfg = await getConfig(interaction.guild.id);
        const channelId = cfg.welcome_channel || 'Not set';
        const msg = cfg.welcome_message || 'Default';
        await interaction.reply({ content: `Channel: ${channelId}\nMessage: ${msg}\nBanner: ${cfg.banner_enabled ? 'On' : 'Off'}`, ephemeral: true });
    }
};
