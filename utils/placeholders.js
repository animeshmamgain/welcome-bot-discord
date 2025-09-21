// utils/placeholders.js
function formatMessage(template, member) {
  if (!template) template = 'Hi {mention}! Welcome to {server} 😘';
  return template
    .replace(/{mention}/g, `<@${member.id}>`)
    .replace(/{user}/g, member.user.username)
    .replace(/{server}/g, member.guild.name)
    .replace(/{count}/g, member.guild.memberCount);
}
module.exports = { formatMessage };
