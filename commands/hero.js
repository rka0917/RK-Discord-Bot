const fs = require("fs");
var heroes = require("../config/owheroes.json");

exports.run = (client, message, args) => {
	const action = args[0];
	if(action == "single"){

		var username = message.member;
		let hero = generateRandomHero(username);
		message.channel.send(hero);
	
	} else if (action == "group"){
		
		var voiceChannel = message.member.voiceChannel;

		if(voiceChannel){
			var players = voiceChannel.members.array();

			if(players.length > 6){
				message.channel.send("Too many people in the chatroom (can't be more than 6)");
				return;
			}
			//Creating a twodimensional array to make sure that the same hero doesn't get selected twice
			var permutationArray = generateHeroArray();
			if(args[1] == "balanced" && players.length < 4){
				switch(players.length){ //How many heroes do we need to generate
					case 6://TODO Cut down on the code by making a function for the repeated parts
					case 5:
						console.log("A 5 or a 6");
						//Generate a healer
						generateBalancedTeamMembers(players, permutationArray, 3);
						//Generate a tank
						generateBalancedTeamMembers(players, permutationArray, 2);
						//Generate an assasin
						generateBalancedTeamMembers(players, permutationArray, 0);
						//Generate heroes for the rest of the team
						players.forEach(function(current){
							console.log(current.user.username);
							hero = generateRandomGroupHero(current, permutationArray);
							message.channel.send(hero);
						})
						break;
					case 4:
						console.log("A 4");
						//Generate a healer
						generateBalancedTeamMembers(players, permutationArray, 3);
						//Generate a tank
						generateBalancedTeamMembers(players, permutationArray, 2);
						//Generate heroes for the rest of the team
						players.forEach(function(current){
							console.log(current.user.username);
							hero = generateRandomGroupHero(current, permutationArray);
							message.channel.send(hero);
						})
						break;
				}


			} else {
				players.forEach(function(current){
					console.log(current.user.username);
					hero = generateRandomGroupHero(current, permutationArray);
					message.channel.send(hero);
				})
			}
			
		}

	} else if (action == "add"){ // TODO restrict it to admin maybeh???

		let name = args[1];
		let category;

		switch(args[2]){
			case "offense":
				category = "0";
				break;
			case "defense": 
				category = "1";
				break;
			case "tank":
				category = "2";
				break;
			case "support":
				category = "3";
				break;
			default:
				message.channel.send(args[2] + " is not a valid category.");
				throw args[2] + " is not a valid category.";
				break;
		}

		heroes[category].push(", play " + name);
		fs.writeFile("/home/rakeem/Documents/Javascript space/config/owheroes.json", JSON.stringify(heroes) , (err) => {
			if (err){
				console.log(err);
			} else {
				message.channel.send("Added hero " + name);
			}
		});

	} else if (action == "remove"){ //TODO restrict it to admin maybeh???

		let name = args[1];

		for(i = 0; i < 4; i++){
			let category = heroes[i.toString()];
			let index = category.indexOf(", play " + name);
			if(index != -1){
				category.splice(index, 1);
				fs.writeFile("/home/rakeem/Documents/Javascript space/config/owheroes.json", JSON.stringify(heroes) , (err) => {
					if (err){
						console.log(err);
					} else {
						message.channel.send("Removed hero " + name);
					}
				});
				break;
			}
		}

	} else if (action == "help"){
		//TODO List off all hero commands
		const embed = createHeroInstructionEmbed();
		console.log(embed);
		message.channel.send(embed);
	} 


}

function generateBalancedTeamMembers(players, permutationArray, hero_type){
	let player_num = getRandomInt(0, players.length - 1);
	let hero = generateRandomGroupHero(players[player_num], permutationArray, hero_type);
	players.splice(player_num, 1);
	message.channel.send(hero);
}

function createHeroInstructionEmbed(){
	return {
		"embed":{
			"color": 3447003,
			"title": "[Hero-command help]",
			"fields":[{"name": "hero single", "value": "Randomize a hero for the callee."},
			{"name": "hero group", "value": "Bot randomizes heroes for every person in the callee's chatroom. Will fail if the callee isn't inside a chatroom."},
			{"name": "hero add <name> <category>", "value": "Add a new hero with a name to the roster and the proper category (offense, defense, tank or support)."},
			{"name": "hero remove <name>", "value": "Remove a hero with the corresponding name."},
			{"name": "hero help", "value": "Show all hero commands."}]
		}
	};
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomHero(user){
	let type_num = getRandomInt(0, 3);  		//In the JSON file, 0 = offense, 1 = defense, 2 = tank and 3 = support

	let heroArray = heroes[type_num.toString()];
	let hero_num = getRandomInt(0, heroArray.length - 1);
	return user + heroArray[hero_num];
}

/*function generateRandomGroupHero(user, permutationArray){
	let type_num = getRandomInt(0, 3);  		//In the JSON file, 0 = offense, 1 = defense, 2 = tank and 3 = support

	let heroArray = permutationArray[type_num];

	let hero_num = getRandomInt(0, heroArray.length - 1);

	permutationArray[type_num].splice(hero_num, 1);

	return user + heroes[type_num][hero_num];

}*/

function generateRandomGroupHero(user, permutationArray, type_num = getRandomInt(0, 3)){
	//let type_num = getRandomInt(0, 3);  		//In the JSON file, 0 = offense, 1 = defense, 2 = tank and 3 = support

	let heroArray = permutationArray[type_num];

	let hero_num = getRandomInt(0, heroArray.length - 1);

	permutationArray[type_num].splice(hero_num, 1);

	return user + heroes[type_num][hero_num];

}

function generateHeroArray(){
	var permutationArray = [[], [], [], []];
	for(i = 0; i < 4; i++){
		for(j = 0; j < heroes[i].length; j++){
			permutationArray[i][j] = j;
		}
	}

	return permutationArray;
}


/*I want to make a Overwatch hero select randomizer. The idea is to have a json object that contains all the heores of overwatch, sorted into 
  their individual cateogies (offensive, defensive, tank and support). When called upon, the bot should randomize a hero that the caller should play. 
  The commands that need to be implemented are as follows:
  
  * "%hero single" This will randomize a hero only for the person that asked for it (no balancing rules applied).
  
  * "%hero group" The bot will look at the chatroom that the callee is in and randomize heroes for everyone that is inside the chatroom. There will be rules
  applied to ensure balancing (like not more than two heroes from offensive, or something like that). You could even let the bot enter the room and play a goodlucksoundbyte or something.
  
  * "%hero add <name> <category>" Add a new hero to the roster (should maybe be restricted to admins). 
  
  * "%hero remove <name>" Remove a hero (in case somebody mistyped or is a troll, should maybe also be restricted to admins). 

  *We are definetly gonna need a list command


IDEA FOR THE BALANCED RANDOM TEAM:
With the use of the twodimensional array and the slice function, we can remove the categories that are done...all i need to do is to come up with the rule sets...

2 heroes: 

3 heroes:

4 heroes:

5 heroes:
At least 1 support and 1 tank, the rest doesn't matter. Max 3 of each class. 

6 heroes:
At least 1 support and 1 tank, the rest doesn't matter. Max 3 of each class.  
  */

