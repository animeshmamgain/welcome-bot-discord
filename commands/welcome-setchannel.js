// commands/welcome-setchannel.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setChannel, getConfig } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-setchannel')
    .setDescription('Set the welcome channel for this server')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to use').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    await setChannel(interaction.guild.id, channel.id);
    await interaction.reply({ content: `✅ Welcome channel set to ${channel}`, ephemeral: true });
  }
};
