// commands/welcome-test.js
const { SlashCommandBuilder } = require('discord.js');
const { getConfig } = require('../utils/db');
const { formatMessage } = require('../utils/placeholders');
const { renderBuffer } = require('../renderer/renderer-starter');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Test welcome message/banner in configured channel'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const cfg = await getConfig(interaction.guild.id);
        if (!cfg.welcome_channel) {
            await interaction.editReply({ content: 'No welcome channel set for this guild. Use /welcome-setchannel.' });
            return;
        }
        const channel = await interaction.guild.channels.fetch(cfg.welcome_channel).catch(() => null);
        if (!channel) {
            await interaction.editReply({ content: 'Configured channel not found or inaccessible.' });
            return;
        }

        const text = interaction.user.username;
        const buf = await renderBuffer(text); // returns GIF buffer (via turbo renderer)
        const attachment = new AttachmentBuilder(buf, { name: 'welcome.gif' });

        const greeting = formatMessage(cfg.welcome_message || 'Hi {mention}! Welcome to {server} 😘', interaction.member);
        const embed = new EmbedBuilder()
            .setDescription(`🎉 ${interaction.user.username}`)
            .setImage('attachment://welcome.gif')
            .setColor(0x1af0dc);

        await channel.send({ content: greeting, embeds: [embed], files: [attachment] });
        await interaction.editReply({ content: `✅ Sent test welcome to ${channel}.`, ephemeral: true });
    }
};
