// events/guildMemberAdd.js
const { formatMessage } = require('../utils/placeholders');
const { renderBuffer } = require('../renderer/renderer-starter');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = async function (member, cfg) {
    try {
        const channel = await member.guild.channels.fetch(cfg.welcome_channel).catch(() => null);
        if (!channel) return;

        const username = member.user.username;
        let buf = null;
        if (cfg.banner_enabled) {
            buf = await renderBuffer(username);
        }

        const greeting = formatMessage(cfg.welcome_message || 'Hi {mention}! Welcome to {server} 😘', member);

        if (buf) {
            const attachment = new AttachmentBuilder(buf, { name: 'welcome.gif' });
            const embed = new EmbedBuilder()
                .setDescription(`🎉 Welcome ${username}`)
                .setImage('attachment://welcome.gif')
                .setColor(0x1af0dc);

            await channel.send({ content: greeting, embeds: [embed], files: [attachment] });
        } else {
            await channel.send({ content: greeting });
        }
    } catch (e) {
        console.error('Error in welcome event:', e);
    }
};
