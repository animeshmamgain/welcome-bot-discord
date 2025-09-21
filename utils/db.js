// utils/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'config.sqlite');

const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    welcome_channel TEXT,
    welcome_message TEXT DEFAULT 'Hi {mention}! Welcome to {server} 😘',
    banner_enabled INTEGER DEFAULT 1
  )`);
});

function getConfig(guildId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM guild_config WHERE guild_id = ?', [guildId], (err, row) => {
      if (err) return reject(err);
      if (!row) {
        const defaultRow = { guild_id: guildId, welcome_channel: null, welcome_message: 'Hi {mention}! Welcome to {server} 😘', banner_enabled: 1 };
        db.run('INSERT OR IGNORE INTO guild_config (guild_id, welcome_message, banner_enabled) VALUES (?, ?, ?)', [guildId, defaultRow.welcome_message, defaultRow.banner_enabled], (e) => {
          if (e) console.error('DB insert default failed', e);
          resolve(defaultRow);
        });
      } else resolve(row);
    });
  });
}

function setChannel(guildId, channelId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO guild_config (guild_id, welcome_channel) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET welcome_channel = excluded.welcome_channel', [guildId, channelId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function setMessage(guildId, message) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO guild_config (guild_id, welcome_message) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET welcome_message = excluded.welcome_message', [guildId, message], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { getConfig, setChannel, setMessage };
