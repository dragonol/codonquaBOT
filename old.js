const Discord = require('discord.js');
const {
    prefix,
    token,
    yapi_key
} = require('./config.json');
const ytdl = require('ytdl-core');
const { YoutubeDataAPI } = require("youtube-v3-api");

const client = new Discord.Client();
const queue = new Map();
const yapi = new YoutubeDataAPI(yapi_key);

client.once('ready', () => {
    console.log('Ready!');
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);


    if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}pause`)) {
        pause(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}resume`)) {
        resume(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}help`)) {
        return message.channel.send('!play/!p [URL|Search string]\t--->\tPlay song or add to queue if there\'s one is playing\n!pause\t--->\tPause music\n!resume\t--->\tResume music\n!skip\t--->\tSkip to next song\n!stop\t--->\tStop music and delete all songs in queue\n');
    } else if (message.content.startsWith(`${prefix}vyden`)) {
        return message.channel.send('Angel^^');
    } else if (message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
        execute(message, serverQueue);
        return;
    } else {
        message.channel.send('You need to enter a valid command!')
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(' ');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.channel.send('I need the permissions to join and speak in your voice channel!');
    }

    var songUrl = args[1];

    if (!validURL(args[1])) {
        const searchString = args.slice(1).join(' ');
        await yapi.searchAll(searchString, 1, { type: 'video' }).then((data) => {
            songUrl = 'https://www.youtube.com/watch?v=' + data.items[0].id.videoId;
        }, (err) => {
            console.log(err);
        })
    }

    const songInfo = await ytdl.getInfo(songUrl);
    song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
            message.channel.send(`Playing [${song.title}]`);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        if (!serverQueue.songs) {
            play(message.guild, song);
            message.channel.send(`[Playing ${song.title}]`);
        }
        else {
            return message.channel.send(`[${song.title}] has been added to the queue!`);
        }
    }

}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip the music!');
    if (serverQueue.songs.length <= 1 || !serverQueue) return message.channel.send('There is no song to skip!');
    serverQueue.songs.shift();
    message.channel.send(`Skipped to [${serverQueue.songs[0].title}]`);
    play(message.guild, serverQueue.songs[0]);
}

function pause(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to pause the music!');
    if (!serverQueue || !serverQueue.songs) return message.channel.send('There is no song to pause!');
    if (serverQueue.connection.dispatcher.paused) return message.channel.send('The song has already paused!');
    message.channel.send(`Paused [${serverQueue.songs[0].title}]`);
    serverQueue.connection.dispatcher.pause();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
    if (!serverQueue || !serverQueue.songs) return message.channel.send('There is no song currently playing!');
    message.channel.send(`Stopped music`);
    serverQueue.connection.disconnect();
    queue.delete(message.guild.id);
}

function resume(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to resume the music!');
    if (!serverQueue || !serverQueue.songs) return message.channel.send('There is no song to resume!');
    if (!serverQueue.connection.dispatcher.paused) return message.channel.send('The song is already been playing!');
    message.channel.send(`Resumed [${serverQueue.songs[0].title}]`);
    serverQueue.connection.dispatcher.resume();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.connection.disconnect();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on('end', () => {
            console.log('Music ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

client.login(token);