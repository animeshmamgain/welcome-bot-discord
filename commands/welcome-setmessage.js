// commands/welcome-setmessage.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setMessage } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-setmessage')
    .setDescription('Set the welcome message (supports {mention}, {user}, {server}, {count})')
    .addStringOption(opt => opt.setName('message').setDescription('Message template').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    await setMessage(interaction.guild.id, message);
    await interaction.reply({ content: '✅ Welcome message updated.', ephemeral: true });
  }
};
