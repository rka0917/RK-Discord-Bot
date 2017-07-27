const Discord = require("discord.js");
const config = require("./config/config.json");
const auth = require("./config/auth.json");
const client = new Discord.Client();


client.login(auth.token);

client.on("ready", () => {
	console.log("I am ready!");
});


client.on("message", (message) => {


	//If the message isn't inteded for the bot or is from another bot
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	if(message.content.startsWith(config.prefix)){

		const args = message.content.split(" ");
		console.log(args);
		const command = args.shift().slice(config.prefix.length);

		try{
			console.log(`./commands/${command}.js`);
			let commandFile = require(`./commands/${command}.js`);
			commandFile.run(client, message, args);
			console.log("Command done! Awaiting next command!");
		} catch (error){
			console.log(error);
		}
	}
});


//MAKE A MUSIC BOT AND A BOT THAT PLAYS YOUTUBE VIDEOS FOR MULTIPLE USERS AT THE SAME TIME

