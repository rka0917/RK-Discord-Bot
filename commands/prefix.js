const fs = require("fs");
const config = require("../config/config.json");

//TODO Change it so only admin or moderator can change the prefix

//Command to change the prefix
exports.run = (client, message, args) => {
	let newprefix = args[0];
	console.log(newprefix);
  	config.prefix = newprefix;

  	fs.writeFile("/home/rakeem/Documents/Javascript space/config/config.json", JSON.stringify(config), (err) => 
  		console.error);

  	console.log("Done with prefix!");
}