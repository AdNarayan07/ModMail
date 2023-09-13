const Discord = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const document = dom.window.document;

const { timeStamp } = require("console");
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'MESSAGE_CONTENT', 'DIRECT_MESSAGES'], partials: ['CHANNEL'] });
const { Collection, Client } = require("discord.js");
module.exports = client;
client.login(process.env.token);


client.on("ready", () => {
    require("./events/ready")(client)
})

client.on("messageCreate", (message) => {
    require("./events/messageCreate")(message)
});
 