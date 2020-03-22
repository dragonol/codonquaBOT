const axios = require('axios');
const youtubeApiKey = require('./../config.json').youtubeApiKey;

module.exports = {
    validURL: function (str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '(m\\.)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

        return {
            valid: !!pattern.test(str),
            domain: RegExp.$3
        }
    },

    youtubeSearch: async function (args) {
        // construct youtube search URL
        var searchURL = `https://www.googleapis.com/youtube/v3/search?part=id&key=${youtubeApiKey}`;

        // construct youtube find video URL
        var findVideoURL = `https://www.googleapis.com/youtube/v3/videos?key=${youtubeApiKey}`;
        for (var prop in args) {
            if (prop == 'part') {
                findVideoURL += `&${prop}=${args[prop]}`;
                continue;
            }
            searchURL += `&${prop}=${args[prop]}`;
        }

        // get video IDs
        var videoIDs = [];
        await axios.get(searchURL)
            .then(function (data) {
                data.data.items.forEach(item => {
                    videoIDs.push(item.id.videoId);
                });
            })
            .catch(function (err) {
                console.log(err);
            })

        // get result videos
        resultVideos = [];
        for (var i in videoIDs) {
            await axios.get(`${findVideoURL}&id=${videoIDs[i]}`)
                .then(function (data) {
                    data.data.items.forEach(item => {
                        item.video_url = 'https://www.youtube.com/watch?v=' + item.id;
                        resultVideos.push(item);
                    });
                })
        }

        return resultVideos;
    },
}