const ytdl = require('ytdl-core');
const auth = require("../config/auth.json");
var https = require('https');

const ytAuth = auth.ytAPIkey;
var musicQueue = [];
var iReady = true; 
var streamOptions = { seek: 0, volume: 0.5};
var boundVoiceChannel = null;
var dispatcher = null;
var repeat = "off";
var repeatList = [];
//TODO Look at the repeat function (add each new song on the repeatList incrementaly) or display).
//TODO Implement the possibility for the user to choose from search alternatives when queueing a song
//TODO Look at bug when booting bot while it is sitting in a chatroom and then try to play music
//TODO Not queuing past the last song (so last song is always in the list)
exports.run = (client, message, args) => {
	const action = args[0];

	//Are we ready to start a command?
	if(iReady){
		if(action == "q" || action == "queue"){ // Queue songs or show queue
			iReady = false;
			if(args[1] != undefined){
				var searchWords = args.slice(1);
				var searchQuery = createSearchQuery(searchWords);
				sendQueryAndQueueSong(searchQuery, message.channel);
			} else {
				showQueue(message);
				iReady = true;
			}
		} else if(action == "p" || action == "play"){ // Start playing songs
			console.log(dispatcher);
			if(!dispatcher){  // I check this to make sure that the bot isn't playing somewhere else
				if(musicQueue.length > 0){
					playSong(client, message);
				} else {
					message.channel.send("There is nothing to play!");
				}
			}

		} else if((action == "s" || action == "skip") && dispatcher) { //Is a song playing???
			console.log("We are starting with skip command");
			dispatcher.end("skip");
			dispatcher = null;
			//dispatcher.end();

		} else if(action == "l" || action == "leave"){ //Leave voice channel
			dispatcher.end("leave");
			boundVoiceChannel.leave();
			boundVoiceChannel = null;
			dispatcher = null;
		} else if(action == "j" || action == "join"){ //Bot joins the voiceChannel
			boundVoiceChannel = message.member.voiceChannel;
			boundVoiceChannel.join();
		} else if(action == "pq" || action == "purgequeue"){
			musicQueue = [];
			repeatList = [];
		} else if(action == "r" || action == "repeat"){
			switch(args[1]){
				case "all":
					repeat = args[1];
					repeatList = musicQueue;
					message.channel.send("Repeat has been set to " + args[1]);
					break;
				case "one": 
					repeat = args[1];
					message.channel.send("Repeat has been set to " + args[1]);
					break;
				case "off":
					repeat = args[1];
					message.channel.send("Repeat has been set to " + args[1]);
					break;
			}
		}

//TODO Coming commandos are: Play, Skip, Join/leave channel, Stop (note that stop/play are very similar to join/leave)
	} 
}

function createSearchQuery(searchWords){
	var searchQuery = searchWords.splice(0, 1);
	searchWords.forEach(function(word){
		searchQuery += `+${word}`;
	});

	return searchQuery;
}

function sendQueryAndQueueSong(searchQuery, channel){

	var requestUrl = "https://www.googleapis.com/youtube/v3/search" + `?part=snippet&maxResults=1&q=${searchQuery}&key=${ytAuth}`;
	https.get(requestUrl, (res) => {

		let rawData = '';

		res.on('data', (chunk) => { rawData += chunk; });
 		res.on('end', () => {
    		try {
      			const parsedData = JSON.parse(rawData);
      		

      			if(parsedData.items[0].id.kind === 'youtube#video'){
      				var vidId = parsedData.items[0].id.videoId;
      				var vidTitle = parsedData.items[0].snippet.title;
      				musicQueue.push({
      					'streamUrl' : vidId, 
      					'vidTitle' : vidTitle
      				});
      			}
      			channel.send(parsedData.items[0].snippet.title + " have been added to the queue!");
      			iReady = true;

    		} catch (e) {
      			console.error(e.message);
      			iReady = true;
    		}


  		});
	});

}

function showQueue(message){
	let queueString = "\n[Music Queue]";

	for(i = 0; i < musicQueue.length; i++){
		queueString += `\n${i+1}: ${musicQueue[i].vidTitle}`;
	}
	message.channel.send({	"embed": {
   			"description" : `${queueString}`
  		}});

}

function playSong(client, message){
	if(!boundVoiceChannel && musicQueue.length > 0){
		boundVoiceChannel = message.member.voiceChannel;
		boundVoiceChannel.join();
	}

	if(boundVoiceChannel == message.member.voiceChannel){//put dispatcher = null whenever we stop
		console.log("We are setting the stream");
		var stream = ytdl('https://www.youtube.com/watch?v=' + musicQueue[0].streamUrl,  { filter : 'audioonly' });

		dispatcher = client.voiceConnections.first().playStream(stream, streamOptions);
		dispatcher.on("end", end =>{
			console.log("I am the end called: " + end);
			if(end == "leave"){
				console.log(end + " is stopping the thing");
				//dispatcher = null;
			} else if(end){
				console.log("end is: " + end);
				console.log(end + " is in the end clause of dispatcher!\n");

				if(repeat != "one"){
					queueNextSong();
				}
	
				if(musicQueue.length > 0){
					console.log(end + " is playing the next song");
					playSong(client, message);
				} else {
					dispatcher = null;
				}
			}
		})
		
		dispatcher.on('error', (err) => {
          	       console.log(err);
        });
	}

//APPERENTLY IT SKIPS TWO SONG EVERY ODD TIME, BUT WORKS CORRECTLY EVERY EVEN TIME, there is a problem with the discord.js modules
}

function queueNextSong(){
	musicQueue.splice(0,1);
	console.log(musicQueue);
	//TODO We might wanna save the removed songs for repeat function purposes
	if(!(musicQueue.length > 0) && repeat == "all"){
		musicQueue = repeatList;
	}
}

function stopPlaying(){
	dispatcher = null;
}


/*function createAndSendSearchEmbed(searchResponse, message){
	message.channel.send({	"embed": {
   			"description" : `\n[Search Suggestions]\n1: ${searchResponse.items[0].snippet.title}\n2: ${searchResponse.items[1].snippet.title}\n3:${searchResponse.items[2].snippet.title}` 
  		}});
}*/

/*var streamOptions = { seek: 0, volume: 0.5};

	var voiceChannel = message.member.voiceChannel;

	voiceChannel.join()
  			.then(connection => {
  				const stream = ytdl('https://www.youtube.com/watch?v=VrR-jlDe7vs', { filter : 'audioonly' });

  				const dispatcher = connection.playStream(stream, streamOptions);
  				dispatcher.on("end", end => {
  					console.log("We are done with music test request!");
  					voiceChannel.leave();

  				})
  			})
  			.catch(err => console.log(err));*/

/*
Here is the specification from the current bot: 

[Music Help]

music q | queue - Shows queue
music q | queue [song name (yt) | url] - Queues a song or playlist
   music q [song name (yt) | url] --next - Queues song or playlist to the next position(s)

music qp | queueplay [song name (yt) | url] - Queues a song and plays from the start of the queue.

music sq | showqueue - Shows queue
music pg | purge - Clears queue
music d | delete <itemNumber|search>- Deletes item(s) from the queue

music p | play - Starts playing queued song(s)
music s | skip - Skips current song
music sf | shuffle - Shuffles queue randomly 
music r | repeat <all|one|off> - Turns on|off repeat

music pv | providers - Shows a list of available music providers.

music j | join - Joins your current voice channel *note you must be in the voice channel* 
music l | leave - Leaves the voice channel

<> = required information, [] = optional information, | = or, do not include <> [] or | in your command input
Please join the support server for any questions. (=support for link)

*/

/*[Page 1/1]

 1 : PC Longplay [333] Doom 3 BFG Edition (part 1 of 4)
 2 : Kamli - Full Song | DHOOM:3 | Katrina Kaif | Aamir Khan | Sunidhi Chauhan | Pritam
 3 : Doom 3 - Part 1 - Mars City
 c : Cancel
*/