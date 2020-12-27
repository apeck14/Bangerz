const config = require('./config.json');
const { Client } = require('discord.js');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const bot = new Client();
const ytsr = require('ytsr');
const stringSimilarity = require('string-similarity');
const ytpl = require('ytpl');
const Spotify = require('node-spotify-api'); 
const cheerio = require('cheerio');
const axios = require('axios');

const PREFIX = '>';
const HEX = "#189de4";
const emojis = ['✅', '❌'];
const numEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

let nowPlayingEmbeds = [];
let queueEmbeds = [];

let spotify = new Spotify({
    id: config.spotify_id,
    secret: config.spotify_secret
});

var queue = [];
var queueTitles = [];
var playing = false;
var dispatcher = null;
var connection;

let plSongs = [];

let playlistTitles = [];
let playlistIDs = [];

var nowPlayingChannel;

function playMusic(){
    if(queue.length === 0) return;

    dispatcher = connection.play(ytdl(queue[0], {dlChunkSize: 0, highWaterMark: 1 << 25, filter: format => format.container === 'webm' && format.itag !== 140, quality: 'highestaudio'}), {bitrate: 'auto', highWaterMark: 25, type: "webm/opus", volume: false});
    playing = true;

    const nowPlaying = new Discord.MessageEmbed().setTitle("Now Playing").setColor(HEX).setDescription(`**[${queueTitles[0]}](${queue[0]})**`);

    nowPlayingChannel.send(nowPlaying);

    dispatcher.on('finish', () => {
        nowPlayingEmbeds.forEach(msg => {
            msg.delete();
        });
    
        nowPlayingEmbeds = [];

        queue.shift();
        queueTitles.shift();

        if(queue[0]) playMusic();
        else {
            playing = false;
            return console.log("queue finished");
        }
    })
}

function shuffle(arr){
    if(arr.length === 0) return;

    var m = arr.length, t, i;

    while(m){
        i = Math.floor(Math.random() * m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
    }
    return arr;
}

function fixTitle(title){
    if(typeof title === 'string' || title instanceof String){
        return title
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/["]+/g, "")
        .replace("(Official Video)", "")
        .replace("[Official Video]", "")
        .replace("(official video)", "")
        .replace("[official video]", "")
        .replace("(Official HD Video)", "")
        .replace("[Official HD Video]", "")
        .replace("(Official Audio)", "")
        .replace("[Official Audio]", "")
        .replace("[official audio]", "")
        .replace("(Official Music Video)", "")
        .replace("[Official Music Video]", "")
        .replace("( Official Video )", "")
        .replace("[ Official Video ]", "")
        .replace("( official video )", "")
        .replace("[ official video ]", "")
        .replace("( Official HD Video )", "")
        .replace("[ Official HD Video ]", "")
        .replace("( Official Audio )", "")
        .replace("[ Official Audio ]", "")
        .replace("[ official audio ]", "")
        .replace("( Official Music Video )", "")
        .replace("[ Official Music Video ]", "")
        .replace("- OFFICIAL VIDEO", "")
        .replace("- official video")
        .replace("- OFFICIAL AUDIO")
        .replace("- official audio")
        .replace("(HD)", "")
        .replace("[HD]", "")
        .replace(" (HD) ", "")
        .replace(" [HD] ", "")
        .replace("(HQ)", "")
        .replace("[HQ]", "")
        .replace("(HQ Audio)", "")
        .replace("[HQ Audio]", "")
        .replace(" (Official Video) ", "")
        .replace(" [Official Video] ", "")
        .replace(" (official video) ", "")
        .replace(" [official video] ", "")
        .replace(" (Official HD Video) ", "")
        .replace(" [Official HD Video] ", "")
        .replace(" (Official Audio) ", "")
        .replace(" [Official Audio] ", "")
        .replace(" [official audio] ", "")
        .replace(" (Official Music Video) ", "")
        .replace(" [Official Music Video] ", "")
        .replace("(Music Video HD)", "")
        .replace("[Music Video HD]", "")
        .replace(" ( Official Video ) ", "")
        .replace(" [ Official Video ] ", "")
        .replace(" ( official video ) ", "")
        .replace(" [ official video ] ", "")
        .replace(" ( Official HD Video ) ", "")
        .replace(" [ Official HD Video ] ", "")
        .replace(" ( Official Audio ) ", "")
        .replace(" [ Official Audio ] ", "")
        .replace(" [ official audio ] ", "")
        .replace(" ( Official Music Video ) ", "")
        .replace(" [ Official Music Video ] ", "")
        .replace("(Lyrics)", "")
        .replace("[Lyrics]", "")
        .replace(" (Lyrics) ", "")
        .replace(" [Lyrics] ", "")
        .replace("Lyrics", "")
        .replace("lyrics", "")
        .replace("(Audio)", "")
        .replace("[Audio]", "")
        .replace(" (Audio) ", "")
        .replace(" [Audio] ", "")
        .replace("(AUDIO)", "")
        .replace("[AUDIO]", "")
        .replace(" (AUDIO) ", "")
        .replace(" [AUDIO] ", "")
        .replace("(audio)", "")
        .replace("[audio]", "")
        .replace(" (audio) ", "")
        .replace(" [audio] ", "")
        .replace("(Video)", "")
        .replace("[Video]", "")
        .replace(" (Video) ", "")
        .replace(" [Video] ", "")
        .replace("(VIDEO)", "")
        .replace("[VIDEO]", "")
        .replace(" (VIDEO) ", "")
        .replace(" [VIDEO] ", "")
        .replace("(video)", "")
        .replace("[video]", "")
        .replace(" (video) ", "")
        .replace(" [video] ", "")
        .replace("(Lyric Video)", "")
        .replace("[Lyric Video]", "")
        .replace(" (Lyric Video) ", "")
        .replace(" [Lyric Video] ", "")
        .replace("(Official Lyric Video)", "")
        .replace("[Official Lyric Video]", "")
        .replace(" (Official Lyric Video) ", "")
        .replace(" [Official Lyric Video] ", "")
        .replace("OFFICIAL AUDIO", "")
        .replace("official audio", "")
        .replace("OFFICIAL VIDEO")
        .replace("official video", "")
        .replace("OFFICIAL VERSION", "")
        .replace(" OFFICIAL VERSION ", "")
        .replace("(WSHH Exclusive - Official Music Video)", "")
        .replace("[WSHH Exclusive - Official Music Video]", "")
        .replace("(WSHH Exclusive - Official Audio)", "")
        .replace("[WSHH Exclusive - Official Audio]", "")
        .replace("(Official Audio Video HD)", "")
        .replace("[Official Audio Video HD]", "")
        .replace("(Official Visualizer)", "")
        .replace("[Official Visualizer]", "")
        .replace("(Official Lyric Visualizer)", "")
        .replace("[Official Lyric Visualizer]", "")
        .replace("(Visualizer)", "")
        .replace("[Visualizer]", "")
        .replace("[Unreleased]", "")
        .replace(" [Unreleased] ", "")
        .replace("(Unreleased)", "")
        .replace(" (Unreleased) ", "")
        .replace("(Northsbest)", "")
        .replace("(Explicit)", "")
        .replace("[Explicit]", "")
        .replace("(explicit)", "")
        .replace("[explicit]", "")
        .replace("(on iTunes)", "")
        .replace("[on iTunes]", "")
        .replace("[MSYKM]", "")
        .replace("(MSYKM)", "")
        .replace("(Icon Video)", "")
        .replace("[Icon Video]", "")
        .replace("[from SCOOB! The Album]", "")
        .replace("(from SCOOB! The Album)", "")
        .replace("(2020 Version / Lyric Video)", "")
        .replace("(Official Acoustic Audio)", "")
        .replace("[Official Acoustic Audio]", "")
        .replace("(Acoustic)", "")
        .replace("[Acoustic]", "")
        .replace("(The Acoustic Sessions)", "")
        .replace("(Radio Version)", "")
        .replace(" (Radio Version) ", "")
        .replace("[1080P HD Quality]", "")
        .replace("(1080P HD Quality)", "")
        .trim();
    }
}

async function fetchHTML(url){
    const { data } = await axios.get(url);
    return cheerio.load(data);
}

bot.on('ready', () => {
    console.log('Bangerz is online!');

    bot.user.setPresence({
        activity: {
            name: 'Use ">help"'
        }
    });

});

bot.on('disconnect', () => {
    console.log('Bangerz has disconnected.')
});

bot.on('error', err => {
    console.error(`Error: ${err}`);
});

bot.on('message', async message => {
    
    if(message.author.bot){
        if(message.embeds[0].title === 'Now Playing'){
            nowPlayingEmbeds.push(message);
        }
        else if(message.embeds[0].title === '__Queue__'){
            queueEmbeds.push(message);
        }
        return;
    }

    if(message.content.trim()[0] !== PREFIX) return;

    let cmd = '';
    let arg;

    let embed;

    let index;
    let comparison;
    let desc;

    //set cmd
    if(message.content.indexOf(" ") === -1) cmd = message.content.substr(PREFIX.length).trim();
    else cmd = message.content.substr(PREFIX.length, message.content.indexOf(" ")-1).trim();

    switch(cmd.toLowerCase()){
        case 'help': 
            embed = new Discord.MessageEmbed()
                .setDescription("**__Commands__**\n*Standard music player commands.*")
                .setColor(HEX)
                .addFields(
                    {
                        name: '>p *<song title>*',
                        value: 'Play a song (will add to queue if a song is already playing)'
                    },
                    {
                        name: ">skip",
                        value: 'Skip the current song'
                    },
                    {
                        name: ">jump *<song title>*",
                        value: "Jump to a song in the queue"
                    },
                    {
                        name: ">remove *<song title>*",
                        value: "Remove a specific song from the queue."
                    },
                    {
                        name: ">clear",
                        value: "Clears the queue"
                    },
                    {
                        name: ">queue",
                        value: "Shows the queue"
                    },
                    {
                        name: ">pause",
                        value: "Pause the current song"
                    },
                    {
                        name: ">resume",
                        value: "Resume the current song"
                    },
                    {
                        name: ">sp *<Spotify playlist URL>*",
                        value: "Play a Spotify playlist."
                    },
                    {
                        name: ">spu *<Spotify user ID or Spotify user URL>*",
                        value: "Play a user's Spotify playlists."
                    }
                );

            message.channel.send(embed);

            break;
        case 'p':
            arg = message.content.slice(PREFIX.length + "p".length).trim();
            embed = new Discord.MessageEmbed().setColor(HEX);
            
            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!"));
                break;
            }
            if(!arg){
                message.channel.send(embed.setDescription("You must add parameters."));
                break;
            }
            if(queue.length >= 100){
                message.channel.send(embed.setDescription("Queue is too full. Use >skip, >jump or >clear and try again."));
                break;
            }

            try{
                //if youtube playlist
                if(ytpl.validateID(arg)){
                    const pl = await ytpl(arg);
                    console.log(pl);

                    if(queue.length === 0) message.channel.send(embed.setDescription(`Playing **[${pl.title}](${pl.url})**`));
                    else message.channel.send(embed.setDescription(`Queued **[${pl.title}](${pl.url})**`));

                    pl.items.forEach(song => {
                        queue.push(song.url);
                        queueTitles.push(fixTitle(song.title));
                    });
                }
                //if song title
                else{
                    let results = await ytsr(arg + " audio", {limit: 1});
    
                    //if no results
                    if(results.results === 0){
                        message.channel.send(embed.setDescription("No search results."));
                        break;
                    }
    
                    let title = fixTitle(results.items[0].title);
                    let link = results.items[0].url;
                    
                    //if queue is empty don't send queued embed
                    if(queue.length !== 0) message.channel.send(embed.setDescription(`Queued **[${title}](${link})**`));
    
                    queue.push(link);
                    queueTitles.push(title);
    
                }
            } catch (err) {
                console.log(err);
                message.channel.send(embed.setDescription("Unexpected error. Try again."));
                break;
            }
            
            if(!(bot.voice.channel)) connection = await message.member.voice.channel.join();

            if(!playing){
                nowPlayingChannel = message.channel;
                playMusic();
            }

            break;
        case 'skip':
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!").setColor(HEX));
                break;
            }
            if(queue.length === 0){
                message.channel.send(embed.setDescription("Queue is empty!"));
                break;
            }

            message.channel.send(embed.setDescription(`Skipped **[${queueTitles[0]}](${queue[0]})**`));

            nowPlayingChannel = message.channel;

            dispatcher.end();

            break;
        case 'pause':
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!").setColor(HEX));
                break;
            }
            if(queue.length === 0){
                message.channel.send(embed.setDescription("No song is playing."));
                break;
            }
            if(!playing){
                message.channel.send(embed.setDescription("Song is already paused."));
                break;
            }

            message.channel.send(embed.setDescription("Paused."));

            dispatcher.pause(true);

            playing = false;

            break;
        case 'resume':
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!").setColor(HEX));
                break;
            }
            if(queue.length === 0){
                message.channel.send(embed.setDescription("No song is playing."));
                break;
            }
            if(playing){
                message.channel.send(embed.setDescription("Song is already playing."));
                break;
            }

            message.channel.send(embed.setDescription("Resumed."))

            dispatcher.resume();

            playing = true;

            break;
        case 'queue':
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(queueTitles.length === 0){
                message.channel.send(embed.setDescription("**Queue is empty!**\nUse >p to play a song"));
                break;
            }
            else if(queueTitles.length === 1){
                queueEmbeds.forEach(msg => {
                    msg.delete();
                });
                queueEmbeds = [];

                message.channel.send(embed.setTitle("__Queue__").setDescription("**Playing:** " +queueTitles[0]+ "\n\n**Up Next:**\n*Use >p to add songs to the queue!*"));
                break;
            }

            queueEmbeds.forEach(msg => {
                msg.delete();
            });
            queueEmbeds = [];

            desc = "";
            let count = 25;

            if(queueTitles.length < count) count = queueTitles.length;
            for(var i = 0; i < count; i++){
                desc += ("• " + queueTitles[i] + "\n");
            }

            if(queueTitles.length > count) desc = "**Playing:** " + queueTitles[0] + "\n\n**Up Next:**" + desc.substring(queueTitles[0].length + 2) + "*...more*";
            else desc = "**Playing:** " + queueTitles[0] + "\n\n**Up Next:**" + desc.substring(queueTitles[0].length + 2);

            message.channel.send(embed.setTitle("__Queue__").setDescription(desc));

            break; 
        case 'jump':
            arg = message.content.slice(PREFIX.length + "jump".length).trim();
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!"));
                break;
            }
            if(!arg){
                message.channel.send(embed.setDescription("You must add parameters."));
                break;
            }

            if(queue.length === 1 || queue.length === 0){
                message.channel.send(embed.setDescription("Queue is empty!"));
                break;
            }

            //find index of song, if any
            index = -1;

            comparison = stringSimilarity.findBestMatch(arg, queueTitles);
            if(comparison.bestMatch.rating >= 0.05) index = comparison.bestMatchIndex;

            if(index === -1){
                message.channel.send(embed.setDescription("Song not found in queue. Try again."));
                break;
            }

            if(index === 0){
                message.channel.send(embed.setDescription("Song is already playing."));
                break;
            }

            //send confirmation embed
            const jumpConfirmEmbed = await message.channel.send(embed.setDescription(`Are you sure you want to jump to **${queueTitles[index]}**?`));

            //react to embed
            for (const em of emojis) await jumpConfirmEmbed.react(em);
            const jumpCollector = await jumpConfirmEmbed.awaitReactions((r, u) => u.id === message.author.id && emojis.includes(r.emoji.name), {max: 1, time: 20000});
            const jumpFirst = jumpCollector.first();

            //check reaction
            if(!jumpFirst || jumpFirst._emoji.name === '❌'){
                jumpConfirmEmbed.delete();
            }
            else{
                jumpConfirmEmbed.delete();

                message.channel.send(embed.setDescription("Jumped to **" + queueTitles[index]+"**"));

                //update queues
                if(index !== 1){
                    queue.splice(0, index-1);
                    queueTitles.splice(0, index-1);
                }

                nowPlayingChannel = message.channel;

                dispatcher.end();
            }

            break;
        case 'clear':
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!"));
                break;
            }
            if(queue.length === 1 || queue.length === 0){
                message.channel.send(embed.setDescription("Queue is already empty."));
                break;
            }

            //clear queues, besides first element
            queue.splice(1, queue.length-1);
            queueTitles.splice(1, queueTitles.length-1);

            message.channel.send(embed.setDescription("Queue cleared!"));
    
            break;
        case 'remove':
            arg = message.content.slice(PREFIX.length + "plremove".length).trim();
            embed = new Discord.MessageEmbed().setColor(HEX);

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!"));
                break;
            }
            if(!arg){
                message.channel.send(embed.setDescription("You must add parameters."));
                break;
            }

            index = -1;

            //find index of song, if any
            comparison = stringSimilarity.findBestMatch(arg, queueTitles);
            console.log(comparison);
            if(comparison.bestMatch.rating >= 0.05) index = comparison.bestMatchIndex;
            console.log(index);

            if(index === -1){
                message.channel.send(embed.setDescription("Song not found in queue. Try again."));
                break;
            }

            //send confirmation embed
            const removeEmbed = await message.channel.send(embed.setDescription(`Are you sure you want to remove **${queueTitles[index]}** from the queue?`));

            //react to embed
            for (const re of emojis) await removeEmbed.react(re);
            const removeCollector = await removeEmbed.awaitReactions((r, u) => u.id === message.author.id && emojis.includes(r.emoji.name), {max: 1, time: 20000});
            const removeFirst = removeCollector.first();

            //check reaction
            if(!removeFirst || removeFirst._emoji.name === '❌'){
                removeEmbed.delete();
            }
            else{
                if(index === 0){
                    dispatcher.end();

                    removeEmbed.delete();

                    message.channel.send(embed.setDescription(`Removed **${queueTitles[index]}** from queue.`));
                }
                else{
                    removeEmbed.delete();

                    message.channel.send(embed.setDescription(`Removed **${queueTitles[index]}** from queue.`));

                    queueTitles.splice(index, 1);
                    queue.splice(index, 1);
                }
            }
            break;  
        case 'sp':
            arg = message.content.slice(PREFIX.length + "sp".length).trim();
            embed = new Discord.MessageEmbed().setColor("#1DB954");

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!").setColor(HEX));
                break;
            }
            if(!arg){
                message.channel.send(embed.setDescription("You must add a Spotify playlist URL."));
                break;
            }

            message.delete();

            if(queue.length >= 100){
                message.channel.send(embed.setDescription("Queue is too full. Use >skip, >jump or >clear and try again.").setColor(HEX));
                break;
            }
            if(arg.indexOf("/playlist/") === -1 || arg.indexOf("open.spotify") === -1) {
                message.channel.send(embed.setDescription("Invalid Spotify playlist URL."));
                break;
            }

            const playlistID = arg.substr(34, 22);

            //>sp https://open.spotify.com/playlist/1jXUQ4CoiFm8j6UVd2gSRL?si=Z3OnT4MYRUe9nJfBxNTkPA

            //put all song titles into plSongs
            try{
                await spotify.request(`https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=0&limit=100`).then(async res => {
                    let totalSongs = res.total;
                    let pages = Math.ceil(totalSongs / 100);
                    let nextURL = "";

                    res.items.forEach(element => {
                        plSongs.push(element.track.name + " " + element.track.artists[0].name);
                    });

                    if(res.next) nextURL = res.next;

                    for(let p = 1; p < pages; p++){
                        await spotify.request(nextURL).then(data => {

                            data.items.forEach(e => {
                                plSongs.push(e.track.name + " " + e.track.artists[0].name);
                            });

                            if(data.next) nextURL = data.next;
                        });
                    }
                    
                });
            } catch(error) {
                if(error.statusCode === 404) message.channel.send(embed.setDescription("Playlist not found."));
                else if(error.statusCode === 204) message.channel.send(embed.setDescription("Playlist is empty."));
                else if(error.statusCode === 401 || error.statusCode === 403) message.channel.send(embed.setDescription("Invalid authentication."));
                else if(error.statusCode === 429) message.channel.send(embed.setDescription("Max Spotify requests reached. Try again later."));
                else message.channel.send(embed.setDescription("Unexpected error."));
                break;
            }

            shuffle(plSongs);

            plSongs.forEach(async name => {
                let plSong = await ytsr(name + " audio", {limit: 1});

                let plTitle = fixTitle(plSong.items[0].title);
                let plLink = plSong.items[0].url;

                queue.push(plLink);
                queueTitles.push(plTitle);
            });

            if(queue.length !== 0) message.channel.send(embed.setDescription(`Your Spotify playlist has been queued.`));
            else message.channel.send(embed.setDescription(`Your Spotify playlist has been found.`));

            if(!(bot.voice.channel)) connection = await message.member.voice.channel.join();

            if(!playing){
                nowPlayingChannel = message.channel;
                playMusic();
            }
            
            break;
        case 'spu':
            arg = message.content.slice(PREFIX.length + "spu".length).trim();
            embed = new Discord.MessageEmbed().setColor("#1DB954");

            playlistTitles = [];
            playlistIDs = [];

            if(!message.member.voice.channel){
                message.channel.send(embed.setDescription("You must be in a voice channel to use this command!").setColor(HEX));
                break;
            }
            if(!arg){
                message.channel.send(embed.setDescription("You must add a Spotify User ID."));
                break;
            }
            if(queue.length >= 100){
                message.channel.send(embed.setDescription("Queue is too full. Use >skip, >jump or >clear and try again.").setColor(HEX));
                break;
            }

            let userURL;
            //set user URL
            if(arg.indexOf('open.spotify.com/user/') !== -1){
                userURL = arg;
                if(arg.indexOf('?si=') !== -1) arg = arg.substr(arg.lastIndexOf('/')+1, arg.lastIndexOf('?') - arg.lastIndexOf('/') - 1);
                else arg = arg.substr(arg.lastIndexOf('/')+1);
            }
            else userURL = `https://open.spotify.com/user/${arg}`;

            try{
                const $ = await fetchHTML(userURL);

                //add all playlist urls to playlistURLs
                $('a.cover.playlist').each(function(){
                    playlistIDs.push($(this).attr('href').substr(10));
                });

                //add all playlist titles to playlistTitles
                $('span[dir=auto]').each(function(){
                    playlistTitles.push($(this).text());
                });

            } catch(err){
                if(err.response.status === 404) message.channel.send(embed.setDescription("User not found."));
                else message.channel.send(embed.setDescription("Unexpected error."));
                break;
            }

            playlistTitles.shift();

            if(playlistTitles.length === 0){
                message.channel.send(embed.setDescription("No public playlists found."));
                break;
            }

            //send selection embed
            for(let nm = 0; nm < playlistTitles.length; nm++){
                embed.addField(playlistTitles[nm], `[${nm+1}]`, true);
            }

            const plEmbed = await message.channel.send(embed.setTitle('__' + arg + " Playlist's__"));

            let eCount = 10;
            if(playlistIDs.length < eCount) eCount = playlistIDs.length; 

            //react to embed
            for (nm = 0; nm < eCount; nm++) await plEmbed.react(numEmojis[nm]);
            const plCollector = await plEmbed.awaitReactions((r, u) => u.id === message.author.id && numEmojis.includes(r.emoji.name), {max: 1, time: 15000});
            const plFirst = plCollector.first();

            if(!plFirst){
                plEmbed.delete();
            }
            else{
                plEmbed.delete();

                plSongs = [];

                const PL_ID = playlistIDs[numEmojis.indexOf(plFirst._emoji.name)];
                const PL_TITLE = playlistTitles[numEmojis.indexOf(plFirst._emoji.name)];

                console.log(`plID: ${PL_ID}\nplTitle: ${PL_TITLE}`);

                let loadingPL = new Discord.MessageEmbed().setColor("#1DB954").setDescription("Loading **"+PL_TITLE+"**");
                loadingPL = await message.channel.send(loadingPL);

                //add all playlist song titles to plSongs
                try{
                    await spotify.request(`https://api.spotify.com/v1/playlists/${PL_ID}/tracks?offset=0&limit=100`).then(async res => {
                        totalSongs = res.total;
                        pages = Math.ceil(totalSongs / 100);
                        nextURL = res.next;

                        if(pages === 0) return;
                        else if(pages === 1){
                            res.items.forEach(element => {
                                plSongs.push(element.track.name + " " + element.track.artists[0].name);
                            }); 
                        }
                        else{
                            res.items.forEach(element => {
                                plSongs.push(element.track.name + " " + element.track.artists[0].name);
                            }); 

                            for(p = 1; p < pages; p++){
                                await spotify.request(nextURL).then(data => {
    
                                    data.items.forEach(e => {
                                        plSongs.push(e.track.name + " " + e.track.artists[0].name);
                                    });
    
                                    if(data.next) nextURL = data.next;
                                });
                            }
                        }
                    });

                    shuffle(plSongs);
                    console.table(plSongs);

                } catch (err){
                    console.log(err.statusCode);
                }

                //add all plSongs to queue
                if(plSongs.length !== 0){
                    try{
                        await Promise.all(plSongs.map(async name => {
                            plSong = await ytsr(name + " audio", {limit: 1});
            
                            let plTitle = fixTitle(plSong.items[0].title);
                            let plLink = plSong.items[0].url;
            
                            queue.push(plLink);
                            queueTitles.push(plTitle);
                        }));
                    } catch(e){
                        message.channel.send(embed.setDescription("Error while gathering playlist songs."));
                        break;
                    }
                }

                /*
                embed = new Discord.MessageEmbed().setColor("#1DB954");

                if(queue.length === 0){
                    loadingPL.delete();
                    message.channel.send(embed.setDescription("Playing **"+PL_TITLE+"**"));
                }
                else{
                    loadingPL.delete();
                    message.channel.send(embed.setDescription("Queued **"+PL_TITLE+"**"));
                }
                */

                if(!(bot.voice.channel)) connection = await message.member.voice.channel.join();

                if(!playing){
                    nowPlayingChannel = message.channel;
                    playMusic();
                }
            }

            break;
    }
});

bot.on('reconnecting', () => {
    console.log('Bangerz is reconnecting...')
});

bot.login(config.token);

module.exports.fixTitle = fixTitle;