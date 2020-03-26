const SongPlayer = require('./Models/SongPlayer').SongPlayer;
const commandPrefix = require('./../config.json').commandPrefix;

module.exports = function (discordClient, prefix) {
    discordClient.once('ready', () => {
        console.log('Ready!');
    });

    discordClient.once('reconnecting', () => {
        console.log('Reconnecting!');
    });

    discordClient.once('disconnect', () => {
        console.log('Disconnect!');
    });

    // create a song player
    var player = new SongPlayer();

    discordClient.on('message', async message => {
        // set message speaker
        player.message = message;

        // check if message come from bot
        // if (message.author.bot)
        //     return;

        // check if message start with command prefix
        if (!message.content.startsWith(commandPrefix))
            return;

        // get the command and command value
        var pattern = new RegExp(`\\${commandPrefix}([\\w\\d]*) *([\\s\\S]*)`);
        var match = message.content.match(pattern);
        var command = RegExp.$1;
        var commandValue = RegExp.$2;

        switch (command) {
            case 'p':
            case 'play':
                if (commandValue)
                    player.playSong(commandValue);
                break;
            case 'pause':
                player.pauseSong();
                break;
            case 'resume':
                player.resumeSong();
                break;
            case 'skip':
                player.skipSong();
                break;
            case 'rm':
            case 'remove':
                player.remove(commandValue);
                break;
            case 'q':
            case 'queue':
                player.showQueue();
                break;
            case 'vyden':
                message.channel.send('A^g^l');
                break;
            case 'khanhfarm':
            case 'nguyenminh':
                message.channel.send('Sao t lại phải trả lời m :))');
                break;
            default:
                break;
        }
        // if (message.content.startsWith(`${prefix}skip`)) {
        //     skip(message, serverQueue);
        //     return;
        // } else if (message.content.startsWith(`${prefix}stop`)) {
        //     stop(message, serverQueue);
        //     return;
        // } else if (message.content.startsWith(`${prefix}pause`)) {
        //     pause(message, serverQueue);
        //     return;
        // } else if (message.content.startsWith(`${prefix}resume`)) {
        //     resume(message, serverQueue);
        //     return;
        // } else if (message.content.startsWith(`${prefix}help`)) {
        //     return message.channel.send('!play/!p [URL|Search string]\t--->\tPlay song or add to queue if there\'s one is playing\n!pause\t--->\tPause music\n!resume\t--->\tResume music\n!skip\t--->\tSkip to next song\n!stop\t--->\tStop music and delete all songs in queue\n');
        // } else if (message.content.startsWith(`${prefix}vyden`)) {
        //     return message.channel.send('Angel^^');
        // } else if (message.content.startsWith(`${prefix}play`) || message.content.startsWith(`${prefix}p`)) {
        //     execute(message, serverQueue);
        //     return;
        // } else {
        //     message.channel.send('You need to enter a valid command!')
        // }
    });
}