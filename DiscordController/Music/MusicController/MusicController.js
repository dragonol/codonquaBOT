var currSong = {};
var songStream = {};
var songQueue = [];

module.exports = {
    playMusic: async function (message, commandValue) {
        var func = require('./PlayMusic');
        await func(currSong, songStream, songQueue, message, commandValue);
        console.log(songStream);
    },


}