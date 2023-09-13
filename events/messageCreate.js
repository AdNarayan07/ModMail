const client = require("../index");
require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const document = dom.window.document;
const guild = client.guilds.cache.get(process.env.server)

process.env.style = `
div{
    display: inline-block;
}
body {
   background-color: #36393e;
    color: #dcddde;
    font-family: "Whitney";
    font-size: 34px;
    margin: 0;
    padding: 0;
}
.message-container {
  padding-left: 15px;
  margin-top: 15px;
  position: relative; 
  width: 140vw;
}
.parent-container {
  padding: 25px;
  width: 150vw;
  font-size: 16px;
}
.avatar {
    border-radius: 50%;
    height: 50px;
    width: 50px;
    }
.text {
    vertical-align: top;
    width: 120vw;
    padding-left: 8px;
    padding-top: 4px;
}   
.header{
    font-size: 44px;
    vertical-align: 20px;
    width: 130vw;
    padding-left: 8px;
}
hr{
    width:163vw;
}
.code {
  font-family: Arial, sans-serif;
  background-color:#2c2c2c; 
  width: 120vw; 
  padding-left:20px;
}
 .file{
  color: #0acaff;
  background-color:#2c2c2c; 
  width: 100vw; 
  padding:10px;
  vertical-align: center;
  border-radius: 10px;
}`
module.exports = async function handle(message) {
  
   let fileArr = []
  message.attachments.forEach((attachment) => {
      fileArr.push(attachment.proxyURL)
  })
  const mf = fs.readFileSync('./data/openedmails.json', 'utf-8', function(res,err){
    if(err) console.log(err)
  })
  const mails = JSON.parse(mf)
  if(message.author.bot) return;
  const guild = client.guilds.cache.get(process.env.server)
  if(message.channel.type == "DM") {
  const subject = mails.filter(e => e.user == message.author.id)

    if(!subject.length){
      
if(message.content.startsWith('!close')) return message.reply('There is no modmail currently opened')
      
    const createdChannel = await guild.channels.create(
        message.author.username,
      {
        reason: "Recieved a DM from" + message.author.username,
        type: "GUILD_TEXT",
        topic: "Opened - " + message.author.id,
        parent: process.env.parentCategory
      }
  )
      
  console.log("New modmail opened")
      
mails.push({
        user: message.author.id,
        channel: createdChannel.id
      })
      
fs.writeFileSync('./data/openedmails.json', JSON.stringify(mails), "utf-8", function(err){
  if(err) console.log(err)
});
      createdChannel.send(`<@&${process.env.moderator}>, a new ModMail Opened.\n\n
A guide to use the modmail:\n
• \`!close MESSAGE\` Close the modmail with a final message.\n
• \`!r MESSAGE\` Reply to the user with a message. If your message gets reacted with ${process.env.sentEmoji} emoji, it means the message has reached.\n
• \`!del\` Deletes the channel after saving the Transcript in logging channel.\n\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_`)
 createdChannel.send({content:'\n__**'+message.author.username+':**__\n'+message.content,files:fileArr}).then(()=>message.react(process.env.sentEmoji))

 message.author.send("ModMail opened! Wait for the staff to adress you! If you wish to close the modmail, use the command \`!close REASON\`.")
    } else {     
const mcId = subject[0].channel  
const mailChannel = guild.channels.cache.get(mcId)
let content;
if(message.content.startsWith('!close')){
  let reason = message.content.split('!close')[1]
  if(reason.length < 5) return message.reply('The reason should at least have 5 characters!');
   content = `Modmail closed by the user with the reason:\n**${reason}**`;

  const newData = mails.filter(e => e.user !== message.author.id)
  
fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
  if(err) console.log(err)
});
mailChannel.edit({name: message.author.username, topic: "Closed - " + message.author.id}).then(message.reply("ModMail Closed!"))
} else {
  content = message.content;
}
 mailChannel.send({content:'**__'+message.author.username+':__**\n'+content,files:fileArr}).then(()=>message.react(process.env.sentEmoji))
    }
  }
  if(message.channel.parentId == process.env.parentCategory){
    subjectId = message.channel.topic.split(" - ")[1]
   const subject = mails.filter(e => e.user == subjectId);
  const subjectObj = message.guild.members.cache.get(subjectId)
 let content;
    
if(message.content.startsWith('!close')){
  if(!subject.length) return message.reply('The mail is already closed!')
  let reason = message.content.split('!close')[1]
   if(reason) { content = `ModMail closed with the message:\n**${reason}**`; }
    else {
      content = "ModMail Closed"
    }
  const newData = mails.filter(e => e.user !== subjectId)
  //console.log(newData)
fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
  if(err) console.log(err)
});
message.channel.edit({name:"closed-" + subjectObj.user.username, topic: "Closed - " + subjectId}).then(message.reply("ModMail Closed!"))
    subjectObj.send({content:'__**DeathManager:**__\n'+content,files:fileArr}).then(()=>message.react(process.env.sentEmoji)).catch(e=>message.reply(e.stack))
  return;
  }
    if(message.content === '!del'){
      if(subject.length) return message.reply('Close the mail first, use `!close MESSAGE`')
      
      let trChannel = client.channels.cache.get(process.env.trChannel);
      let interaction = message;
          interaction.user = message.author;
      
				let messageCollection = new Discord.Collection();

				let channelMessages = await interaction.channel.messages
					.fetch({
						limit: 100,
					})
					.catch((err) => console.log(err));
		
				messageCollection = messageCollection.concat(channelMessages);

				while (channelMessages.size > 0) {
					let lastMessageId = channelMessages.lastKey();
					channelMessages = await interaction.channel.messages
						.fetch({ limit: 100, before: lastMessageId })
						.catch((err) => console.log(err));

					messageCollection = messageCollection.concat(channelMessages);
				}
      console.log(messageCollection.size);

				const msgs = messageCollection.reverse();

				let html = document.createElement("html");

				let head = document.createElement("head");

				let title = document.createElement("title");

				let body = document.createElement("body");
				let style = document.createElement("style");

				let parentContainer = document.createElement("div");
				parentContainer.className = "parent-container";

				let guildElement = document.createElement("div");
				guildElement.setAttribute("style", "width:150vw; padding:10px");

				let guildImgCont = document.createElement("span");

				let guildTextCont = document.createElement("span");
				guildTextCont.className = "header";

				let guildText = document.createTextNode(interaction.guild.name);

				let guildImg = document.createElement("img");

				let tTitle = document.createTextNode(
					`${interaction.channel.name} - Transcripts`
				);

				const mySecret = process.env["style"];

				let tStyle = document.createTextNode(process.env.style);

				let fontLink = document.createElement("link");
				fontLink.setAttribute(
					"href",
					"//db.onlinewebfonts.com/c/294afa63edf49dc293dd90373066b4d4?family=Whitney"
				);
				fontLink.setAttribute("rel", "stylesheet");
				fontLink.setAttribute("type", "text/css");

				let iconLink = document.createElement("link");
				iconLink.setAttribute(
					"href",
					"https://fonts.googleapis.com/icon?family=Material+Icons"
				);
				iconLink.setAttribute("rel", "stylesheet");

				let viewPort = document.createElement("meta");
				viewPort.setAttribute("name", "viewport");
				viewPort.setAttribute("content", "width=device-width, initial-scale=1");
				viewPort.setAttribute("charset", "utf-8");

				let horizontalRule = document.createElement("hr");

				guildImg.setAttribute("src", interaction.guild.iconURL());
				guildImg.setAttribute("style", "width:75px; border-radius:50%");

				guildImgCont.appendChild(guildImg);
				guildTextCont.appendChild(guildText);
				guildElement.appendChild(guildImgCont);
				guildElement.appendChild(guildTextCont);
				let channelCont = document.createElement("span");
				channelCont.setAttribute(
					"style",
					"font-weight: bold; margin-left: 20px"
				);
				let channelName = document.createTextNode(
					`# ${interaction.channel.name}`
				);
				channelCont.appendChild(channelName);
				let HorRule = document.createElement("hr");
				html.appendChild(head);
				html.appendChild(body);
				head.appendChild(title);
				head.appendChild(fontLink);
				head.appendChild(viewPort);
				head.appendChild(style);
				body.appendChild(guildElement);
				body.appendChild(horizontalRule);
				body.appendChild(channelCont);
				body.appendChild(HorRule);
				body.appendChild(parentContainer);
				title.appendChild(tTitle);
				style.appendChild(tStyle);

				console.log(guildElement);

msgs.forEach(async (msg) => {
					let messageContainer = document.createElement("div");
					messageContainer.className = "message-container";

					const msgAttach = msg.attachments;

					msgIMG = msgAttach.filter((u) => u.contentType.startsWith("image"));

					msgVIDEO = msgAttach.filter((u) => u.contentType.startsWith("video"));

					msgAUDIO = msgAttach.filter((u) => u.contentType.startsWith("audio"));

					msgFILE = msgAttach.filter(
						(u) =>
							!u.contentType.startsWith("image") &&
							!u.contentType.startsWith("video") &&
							!u.contentType.startsWith("audio")
					);

					let avatarDiv = document.createElement("div");
					avatarDiv.className = "avatar-container";

					let img = document.createElement("img");
let IMAGE;
let TAG;
   if(!msg.author){ IMAGE = 'https://cdn.discordapp.com/embed/avatars/1.png?size=1024'
           TAG = 'Deleted User#0000'}
     else {IMAGE =  msg.author.displayAvatarURL()
          TAG = msg.author.tag}
                    img.setAttribute("src", `${IMAGE}`);
					img.className = "avatar";

					let nameElement = document.createElement("span");
					nameElement.setAttribute(
						"style",
						"font-weight: bold; font-size: 1.8em; line-height:60%"
					);

					let textContainer = document.createElement("div");
					textContainer.className = "text";

					let name = document.createTextNode(
			`${TAG} | ${msg.createdAt.toLocaleString("en-US", {
							timeZone: "Asia/Kolkata",
						})} IST`
					);

					let line1 = document.createElement("br");
					let line2 = document.createElement("br");

					avatarDiv.appendChild(img);

					nameElement.appendChild(name);

					nameElement.appendChild(line1);
					nameElement.appendChild(line2);

					messageContainer.appendChild(avatarDiv);
					if (msg.content.startsWith("```") && msg.content.endsWith("```")) {
						let m = msg.content.split("```").join("");
						let y = m.split(`\n`);
						let codeNode = document.createElement("div");
						codeNode.className = "code";
						let textNode = document.createElement("span");
						y.forEach((z) => {
							let a = document.createTextNode(z);
							let b = document.createElement("br");
							textNode.appendChild(a);
							textNode.appendChild(b);
						});

						codeNode.appendChild(textNode);
						textContainer.append(nameElement);
						textContainer.appendChild(codeNode);
					} else if (msg.content.startsWith("`") && msg.content.endsWith("`")) {
						let m = msg.content.split("`").join("");
						let y = m.split(`\n`);
						let codeNode = document.createElement("span");
						codeNode.className = "code";
						let textNode = document.createElement("span");
						y.forEach((z) => {
							let a = document.createTextNode(z);
							let b = document.createElement("br");
							textNode.appendChild(a);
							textNode.appendChild(b);
						});
						codeNode.appendChild(textNode);
						textContainer.append(nameElement);
						textContainer.appendChild(codeNode);
					} else {
						let m = msg.content.split("```").join("");
						let m1 = m.split("`").join("");

						let y = m1.split(`\n`);
						textNode = document.createElement("span");
						y.forEach((z) => {
							let a = document.createTextNode(z);
							let b = document.createElement("br");
							textNode.appendChild(a);
							textNode.appendChild(b);
						});

						textContainer.append(nameElement);
						textContainer.appendChild(textNode);
					}

					if (msgAttach.size > 0) {
						if (msgIMG.size > 0) {
							msgIMG.forEach((img) => {
								let imgAnc = document.createElement("a");
								imgAnc.setAttribute("href", img.proxyURL);
								imgAnc.setAttribute("target", "_blank");
								let imgAtt = document.createElement("img");
								let newLine1 = document.createElement("br");
								let newLine2 = document.createElement("br");
								imgAtt.setAttribute("src", img.proxyURL);
								imgAtt.setAttribute(
									"style",
									"max-width: 85vw; max-height: 85vw; border-radius: 10px"
								);

								imgAnc.appendChild(imgAtt);
								textNode.appendChild(imgAnc);
								textNode.appendChild(newLine1);
								textNode.appendChild(newLine2);
							});
						}

						if (msgVIDEO.size > 0) {
							msgVIDEO.forEach((vid) => {
								let videoElement = document.createElement("video");
								videoElement.controls = true;
								videoElement.style["max-width"] = "85vw";
								videoElement.style["max-height"] = "85vw";
								videoElement.style["border-radius"] = "10px";

								let video = document.createElement("source");
								video.setAttribute("src", vid.proxyURL);
								video.setAttribute("type", vid.contentType);
								let newLine1 = document.createElement("br");
								let newLine2 = document.createElement("br");

								videoElement.appendChild(video);
								textNode.appendChild(videoElement);
								textNode.appendChild(newLine1);
								textNode.appendChild(newLine2);
							});
						}

						if (msgAUDIO.size > 0) {
							msgAUDIO.forEach((aud) => {
								let audioElement = document.createElement("audio");
								audioElement.controls = true;
								audioElement.style["width"] = "100vw";

								let audio = document.createElement("source");
								audio.setAttribute("src", aud.proxyURL);
								audio.setAttribute("type", aud.contentType);
								let newLine1 = document.createElement("br");
								let newLine2 = document.createElement("br");

								audioElement.appendChild(audio);
								textNode.appendChild(audioElement);
								textNode.appendChild(newLine1);
								textNode.appendChild(newLine2);
							});
						}

						if (msgFILE.size > 0) {
							msgFILE.forEach((file) => {
								let fileSIZE = file.size;
								if (fileSIZE <= 1000) {
									filesize = `${fileSIZE} bytes`;
								}

								if (fileSIZE > 1000 && fileSIZE <= 10 ** 6) {
									let fileSiZe = fileSIZE / (1000).toFixed(3);
									filesize = `${fileSiZe} kb`;
								}

								if (fileSIZE > 10 ** 6 && fileSIZE <= 10 ** 9) {
									let fileSiZe = fileSIZE / (10 ** 6).toFixed(3);
									filesize = `${fileSIZE} mb`;
								}
								if (fileSIZE > 10 ** 9) {
									let fileSiZe = fileSIZE / (10 ** 9).toFixed(3);
									filesize = `${fileSIZE} gb`;
								}

								let proXY = file.proxyURL;
								let UrL = proXY.replace("media", "cdn").replace(".net", ".com");

								let fileElement = document.createElement("a");
								let fileDIV = document.createElement("div");
								fileDIV.className = "file";
								let icon = document.createElement("img");
								icon.setAttribute(
									"src",
									"https://media.discordapp.net/attachments/1013028644572110948/1016063219363758180/1662318535119.png"
								);
								icon.style["height"] = "42px";
								let fileNameCont = document.createElement("div");
								fileNameCont.setAttribute(
									"style",
									"vertical-align:5px; margin-left: 10px"
								);

								let fileName = document.createTextNode(file.name);
								let fileSize = document.createTextNode(filesize);
								let nameBreak = document.createElement("br");
								let sizeCont = document.createElement("span");
								sizeCont.style["color"] = "#949494";

								sizeCont.appendChild(fileSize);

								fileNameCont.appendChild(fileName);
								fileNameCont.appendChild(nameBreak);
								fileNameCont.appendChild(sizeCont);

								fileElement.setAttribute("href", UrL);
								fileElement.setAttribute("type", file.contentType);

								let newLine1 = document.createElement("br");
								let newLine2 = document.createElement("br");
								fileDIV.appendChild(icon);
								fileDIV.appendChild(fileNameCont);
								fileElement.appendChild(fileDIV);
								textNode.appendChild(fileElement);
								textNode.appendChild(newLine1);
								textNode.appendChild(newLine2);
							});
						}
					}

					messageContainer.appendChild(textContainer);

					let lineA = document.createElement("br");
					let lineB = document.createElement("br");

					parentContainer.appendChild(messageContainer);
					parentContainer.appendChild(lineA);
					parentContainer.appendChild(lineB);
				});

				let data = html.outerHTML;

				let result = data.split(">").join(">\n\n");

				const save = Promise.resolve(
					fs.writeFileSync(
					`${message.channel.name.split('-')[1]}.html`,
					result,
					"utf8",
					function (err) {
						if (err) return console.log(err);
					}
				))
message.channel.send('Transcripting and Deleting...')
     save.then(
		trChannel.send({
					files: [
`./${message.channel.name.split('-')[1]}.html`,
					], content: 'ModMail deleted by: '+message.author.username+'\n at: '+message.createdAt.toLocaleString('en-IN',{
            timezone:'Asia/Kolkata'
          })
				}).then(()=> {
					message.channel.delete()
					fs.unlinkSync(`${message.channel.name.split('-')[1]}.html`)
				}))

     return;
    }
  // console.log(!subject.length)
    if(!subject.length) return;
    if(message.content.startsWith('!r')){  subjectObj.send({content:`__**${guild.name}: **${message.author.username}__\n`+message.content.split('!r')[1],files:fileArr}).then(()=>message.react(process.env.sentEmoji)).catch(e=>message.reply(e.stack))
   
    }
          }
}
