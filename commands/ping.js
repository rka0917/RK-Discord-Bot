//Standard ping-pong test message
exports.run = (client, message, args) => {
	message.channel.send("pong!").catch(console.error);
}