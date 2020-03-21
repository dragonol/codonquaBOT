const axios = require('axios');
const ytdl = require('ytdl-core');
const generalHelper = require('../../../SupportFunctions/GeneralHelper');

module.exports = {

    youtubeSearch: async function (youtubeApiKey, args) {
        // construct youtube URL
        var url = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}`;
        for (var prop in args) {
            url += `&${prop}=${args[prop]}`;
        }

        // get video URLs
        var videoURLs = [];
        await axios.get(url)
            .then(function (data) {
                data.data.items.forEach(item => {
                    videoURLs.push('https://www.youtube.com/watch?v=' + item.id.videoId);
                });
            })
            .catch(function (err) {
                console.log(err);
            })

        return videoURLs;
    },

    getYoutubeVideoInfo: async function (videoURL) {
        return await ytdl.getInfo(videoURL);
    },

    getYoutubeVideosInfo: async function (videoURLs) {
        var results = [];
        videoURLs.forEach(videoURL => {
            results.push(ytdl.getInfo(videoURL));
        });

        // wait for all results 
        for (var index in results) {
            results[index] = await results[index];
        }

        return results;
    },

    getVideoStream: function (videoURL, args) {
        return ytdl(videoURL, args);
    },

    playSong(songQueue, songStream, song, voiceConnection, message) {
        // announce playing song
        console.log(`Playing [${song.title}]`);
        message.channel.send(`Playing [${song.title}]`);

        // get song stream
        // generalHelper.copyOneLayer(songStream, ytdl(song.video_url, { filter: 'audioonly' }));
        songStream = ytdl(song.video_url, { filter: 'audioonly' });

        // play song in voice channel
        voiceConnection.play(songStream);

        // when song end
        songStream.on('end', function () {
            console.log('song end');
            // if there's no song in queue, stop
            if (songQueue.length == 0) {
                module.exports.neutralizeSong(song);
                return;
            }

            module.exports.playSong(songQueue, songStream, song = songQueue.shift(), voiceConnection, message);
        })
    },

    neutralizeSong: function (song) {
        if (song === null || song === undefined) {
            console.log('Your song is not yet initialized or null!');
        }
        for (var key in song) {
            delete song[key];
        }
    }

}