const generalHelper = require('../../SupportFunctions/GeneralHelper');
const ytdl = require('ytdl-core');

module.exports = {
    SongPlayer: class SongPlayer {

        #currSong;
        #songQueue;
        #voiceConnection;
        #songStream;
        #message;

        constructor() {
            this.#currSong = null;
            this.#songQueue = null;
            this.#voiceConnection = null;
            this.songStream = null;
            this.#message = null;
        }

        get currSong() {
            return this.#currSong;
        }

        get songQueue() {
            return this.#songQueue;
        }

        set message(message) {
            this.#message = message;
        }

        makeSongPlay() {
            // announce playing song
            console.log(`Playing [${this.#currSong.snippet.title}]`);
            this.#message.channel.send(`Playing [${this.#currSong.snippet.title}]`);

            // get song stream
            this.#songStream = ytdl(this.#currSong.video_url, { filter: 'audioonly' });

            // play song in voice channel
            this.#voiceConnection.play(this.#songStream);

            // when song end
            this.#songStream.on('end', function () {
                console.log('song end');
                // if there's no song in queue, stop
                if (this.#songQueue.length == 0) {
                    this.#currSong = null;
                    return;
                }

                // take song out of song queue and set to current song
                this.#currSong = this.#songQueue.shift();

                // continue to play song
                this.makeSongPlay();
            })
        }

        async playSong(commandValue) {
            // valid URL
            const validURLResult = generalHelper.validURL(commandValue);

            // create temp song
            var playSong = null;

            // check if command value is not a URL
            if (!validURLResult.valid) {
                // search youtube for songs
                var peakSongs = await generalHelper.youtubeSearch({
                    part: 'id,contentDetails,snippet',
                    type: 'video',
                    videoCategoryId: '10', // 10 is music category code
                    maxResults: '5',
                    q: commandValue
                });
                console.log('done search');

                // set play song
                playSong = peakSongs[0];
            }
            else if (validURLResult.domain.match('youtube.com')) {
                // get song info and set play song
                playSong = await ytdl.getInfo(commandValue);
            }

            // if there's a song playing
            if (this.#currSong != null) {
                // push song to queue
                this.#songQueue.push(playSong);

                // log out
                console.log(`Add [${playSong.snippet.title}] to queue`);

                // send message to chat channel
                this.#message.channel.send(`Add [${playSong.snippet.title}] to queue`);

                return;
            }
            
            // set current song
            this.#currSong = playSong;

            // join channel
            this.#voiceConnection = await this.#message.member.voice.channel.join();

            // play song
            this.makeSongPlay();
        }

        pauseSong() {
            this.#voiceConnection.dispatcher.pause();
        }
        resumeSong() {
            this.#voiceConnection.dispatcher.resume();
        }
    }
}
