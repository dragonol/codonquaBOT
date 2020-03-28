const generalHelper = require('../../SupportFunctions/GeneralHelper');
const ytdl = require('ytdl-core-discord');

module.exports = {
    SongPlayer: class SongPlayer {
        constructor() {
            this.currSong = null;
            this.songQueue = [];
            this.voiceConnection = null;
            this.songStream = null;
            this.message = null;
        }

        async makeSongPlay() {
            // announce playing song
            console.log(`Playing [${this.currSong.snippet.title}]`);
            this.message.channel.send(`Playing [${this.currSong.snippet.title}]`);

            // get song stream
            this.songStream = await ytdl('https://www.youtube.com/watch?v=' + this.currSong.id, { filter: 'audioonly' });

            // play song in voice channel
            this.voiceConnection.play(this.songStream, { type: "opus" });

            // when song end
            var self = this; // really confuse with js this part :(((
            this.voiceConnection.dispatcher.on('finish', async function () {
                console.log('end song');
                // if there's no song in queue, stop
                if (self.songQueue.length == 0) {
                    self.currSong = null;
                    return;
                }

                // take song out of song queue and set to current song
                self.currSong = self.songQueue.shift();

                // continue to play song
                await self.makeSongPlay();

            }).on('error', console.error);
        }

        async searchSong(commandValue) {
            // valid URL
            var matchURL = null;

            // check if command value is youtube URL
            if (matchURL = generalHelper.matchYoutubeURL(commandValue)) {
                // get song info and set play song
                return await generalHelper.youtubeGetVideo({
                    part: 'contentDetails,snippet',
                    id: matchURL[5] // videoid
                });
            } else if (generalHelper.validURL(commandValue)) {
                this.message.channel.send('Invalid URL');
                return null;
            } else {
                // search youtube videos
                var searchResults =
                    await generalHelper.youtubeSearchVideo({
                        part: 'id',
                        type: 'video',
                        videoCategoryId: '10', // 10 is music category code
                        maxResults: '5',
                        q: commandValue
                    });

                // get youtube videos
                var peakSongs = [];
                for (const item of searchResults) {
                    peakSongs.push(await generalHelper.youtubeGetVideo({
                        part: 'contentDetails,snippet',
                        id: item.id.videoId
                    }))
                }
                console.log('done search');

                return peakSongs[0];
            }
        }

        async playSong(commandValue) {
            // check if join voice channel
            if (!this.message.member.voice.channel) {
                this.message.channel.send('Join voice channel to play song!');
                return;
            }

            //search for song
            var searchSong = await this.searchSong(commandValue);

            // Song not found
            if (searchSong == null) {
                return;
            }

            // if there's a song playing
            if (this.currSong != null) {
                // push song to queue
                this.songQueue.push(searchSong);

                // log out
                console.log(`Add [${searchSong.snippet.title}] to queue`);

                // send message to chat channel
                this.message.channel.send(`Add [${searchSong.snippet.title}] to queue`);

                return;
            }

            // set current song
            this.currSong = searchSong;

            // join channel
            if (this.voiceConnection === null || !(this.voiceConnection == this.message.member.voice.connection)) {
                this.voiceConnection = await this.message.member.voice.channel.join();
            }

            // play song
            await this.makeSongPlay();
        }

        pauseSong() {
            this.voiceConnection.dispatcher.pause();
        }

        resumeSong() {
            this.voiceConnection.dispatcher.resume();
        }

        skipSong() {
            // destroy song stream
            this.voiceConnection.dispatcher.destroy();

            // if there's no song in queue, stop
            if (this.songQueue.length == 0) {
                this.currSong = null;
                return;
            }

            // take song out of song queue and set to current song
            this.currSong = this.songQueue.shift();

            // continue to play song
            this.makeSongPlay();
        }

        remove(pos) {

            // if not an interger exit
            if (!(pos = parseInt(pos))) {
                this.message.channel.send('Invalid remove position!');
                return;
            }

            pos -= 1;

            this.message.channel.send(`Remove [${this.songQueue[pos].snippet.title}] from queue`);
            this.songQueue.splice(pos, 1);
        }

        showQueue() {

            this.message.channel.send(`Playing: ${this.currSong ? this.currSong.snippet.title : 'There\'s no song currently playing'}\nQueue:\n`);

            var displayMessage = '';
            for (let i = 0; i < this.songQueue.length; i++) {
                displayMessage += `${i + 1}. ${this.songQueue[i].snippet.title}\n`;
            }

            if (displayMessage != '') {
                this.message.channel.send(displayMessage);
            }
        }
    }
}
