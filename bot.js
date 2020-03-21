const discord = require('discord.js');

const {
    prefix,
    token,
    youtubeApiKey
} = require('./config.json');
const discordProcess = require('./DiscordController/discordProcess');

const client = new discord.Client();
const queue = new Map();

discordProcess(client, prefix);

client.login(token);

