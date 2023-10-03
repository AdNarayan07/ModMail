const Discord = require("discord.js");
require("dotenv").config();

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'MESSAGE_CONTENT', 'DIRECT_MESSAGES'], partials: ['CHANNEL'] });
module.exports = client;
client.login(process.env.token);


client.on("ready", () => {
    require("./events/ready")(client)
})

client.on("messageCreate", async (message) => {
    require("./events/messageCreate")(message)
});