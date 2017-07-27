const config = require("../config/config.json");

var iReady = true;

//TODO Check bug when it gets multiple requests at the same time (from different users)

exports.run = (client, message, args) => {
	console.log(iReady);
	if(iReady && message.member.voiceChannel !== undefined){
		iReady = false;
  		var member = message.member;
  		var voiceChannel = member.voiceChannel;
  		voiceChannel.join()
  			.then(connection => {
  				const dispatcher = connection.playFile(config.soundfile + '/ishouldgo.mp3');
  				dispatcher.on("end", end => {
  					console.log("We are done with soundByte request!");
  					iReady = true;
  					voiceChannel.leave();

  				})
  			})
  			.catch(err => console.log(err));
  	} else {}
}