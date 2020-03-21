const youtubeApiKey = require('./../../config.json').youtubeApiKey;
const generalHelper = require('../../SupportFunctions/GeneralHelper');
const musicHelper = require('./MusicControllerHelper');

module.exports = async function (currSong, songStream, songQueue, message, commandValue) {
    // valid URL
    const validURLResult = generalHelper.validURL(commandValue);

    var playSong = undefined;

    // check if command value is not a URL
    if (!validURLResult.valid) {
        // search youtube for song URLs
        var songURLs = await musicHelper.youtubeSearch(youtubeApiKey, {
            part: 'id',
            type: 'video',
            videoCategoryId: '10', // 10 is music category code
            maxResults: '5',
            q: commandValue
        });
        console.log('done search');
        // get info of songs
        var peakSongs = await musicHelper.getYoutubeVideosInfo(songURLs);

        console.log('done getinfo');
        // set play song
        playSong = peakSongs[0];
    }
    else if (validURLResult.domain.match('youtube.com')) {
        // get song info and set play song
        playSong = await musicHelper.getYoutubeVideoInfo(commandValue);
    }

    // if there's a song playing
    if (!generalHelper.isEmpty(currSong)) {
        songQueue.push(playSong);
        console.log(`Add [${playSong.title}] to queue`);
        message.channel.send(`Add [${playSong.title}] to queue`);
        return;
    }

    // set current song
    generalHelper.copyOneLayer(currSong, playSong);
    
    // join channel
    var voiceConnection = await message.member.voice.channel.join();

    // play song
    musicHelper.playSong(songQueue, songStream, currSong, voiceConnection, message);
}

