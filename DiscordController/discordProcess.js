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
    });
}