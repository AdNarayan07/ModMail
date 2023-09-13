const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(process.env.token);

module.exports = function ready(client){ 
/*// for guild-based commands
rest.put(Routes.applicationGuildCommands(client.user.id, process.env.server), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(client.user.id), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
  */
	const guild = client.guilds.cache.get(process.env.server)

    client.user.setActivity("DMs| Looking for 📃", {
              type: "WATCHING",
          });
  
  guild.members.fetch().then((members) => { console.log(members.size); 
   })
      console.log("Project running");
    console.log(client.user.username + " online")
}