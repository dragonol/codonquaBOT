const discord = require('discord.js');
const discordToken = require('./config.json').discordToken;
const discordProcess = require('./DiscordController/discordProcess');

const client = new discord.Client();

discordProcess(client);

client.login(discordToken);

