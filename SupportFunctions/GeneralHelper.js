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

        return !!pattern.test(str)
    },
    matchYoutubeURL: function (url) {
        var pattern = new RegExp(String.raw`^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$`);

        // 1.protocol
        // 2.subdomain
        // 3.domain
        // 4.path
        // 5.video code
        // 6.query string

        var match = url.match(pattern);
        return match ? match : false;
    },
    youtubeSearchVideo: async function (args) {
        // construct youtube search URL
        var searchURL = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}`;

        // add args to URLs
        for (var prop in args) {
            searchURL += `&${prop}=${args[prop]}`;
        }

        // search videos
        var results = [];
        await axios.get(searchURL)
            .then(function (data) {
                data.data.items.forEach(item => {
                    results.push(item);
                });
            })
            .catch(function (err) {
                console.log(err);
            })

        return results;
    },
    youtubeGetVideo: async function (args) {
        // construct youtube find video URL
        var getVideoURL = `https://www.googleapis.com/youtube/v3/videos?key=${youtubeApiKey}`;

        for (var prop in args) {
            getVideoURL += `&${prop}=${args[prop]}`;
        }

        // get videos
        var result;
        await axios.get(getVideoURL)
            .then(function (data) {
                result = data.data.items[0];
            })
            .catch(function (err) {
                console.log(err);
            })

        return result;
    },
    YTDurationToMiliseconds: function(duration) {
        var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      
        match = match.slice(1).map(function(x) {
          if (x != null) {
              return x.replace(/\D/, '');
          }
        });
      
        var hours = (parseInt(match[0]) || 0);
        var minutes = (parseInt(match[1]) || 0);
        var seconds = (parseInt(match[2]) || 0);
      
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
      }
}