//calling for modules and declaring variables
const client = require("../index");
require("dotenv").config();
const fs = require("fs");
const mails = require("../data/openedmails.json")
const guild = client.guilds.cache.get(process.env.server)

module.exports = async function handle(message) {
    let fileArr = [];
    message.attachments.forEach((attachment) => {
        let attURL = attachment.proxyURL.replace("media", "cdn").replace(".net", ".com");
        fileArr.push(attURL);
    }) 

    if(message.channel.type == "DM"){
        let memberObj = mails.filter(e => e.user == message.author.id);//memberObj is an array [{user, channel, messageAttachment, status}]
        if(message.author.bot) return; 

        if(memberObj.length === 0) { //Means no channel available for member
            if(message.content.toLowerCase().startsWith('!close')) return message.reply("No modmail open!");
            return openMail(message, fileArr);
        }

        if(!memberObj[0].status) { //Modmail channel available but modmail is closed
            if(message.content.toLowerCase().startsWith('!close')) return message.reply("Modmail already closed!");
            openChannel(memberObj, message, fileArr);
        } else { //Modmail opened
            let notify = client.channels.cache.get(memberObj[0].channel)
            if(message.content.toLowerCase().startsWith('!close')) return closeChannel(memberObj, message, notify, fileArr);
            notify.send({content:'**__'+message.author.username+':__**\n'+message.content, files:fileArr}).catch(e=>message.reply(e.stack)).then(()=>message.react(process.env.sentEmoji))
        }
    }

    if(message.channel.parentId === process.env.parentCategory && message.channel.id !== process.env.trChannel) {
        let memberObj = mails.filter(e => {
            let x = e.channel == message.channel.id
            return x;
        });
        if(memberObj.length === 0) return console.log("memberObject not found");
        let member = guild.members.cache.get(memberObj[0].user);
        
            if(fileArr.length !== 0){
                let dumpyard = client.channels.cache.get(process.env.dumpyard);
                let dumped = await dumpyard.send({content:message.id, files:fileArr}).catch((e)=>message.reply(e.stack));
                let dumpArr = []
                dumped.attachments.forEach((att)=>{
                  dumpArr.push(att.proxyURL.replace("media", "cdn").replace(".net", ".com"))
                })
                let sub = mails.filter(e => e.channel == message.channel.id)
                sub[0].messageAttachments[message.id] = dumpArr;
                const newData = mails.filter(e => e.user !== message.author.id)
                newData.push(sub[0])
                fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
                if(err) console.log(err)
                })
            }
        if(!memberObj[0].status) {
            if(message.content.toLowerCase().startsWith('!close')) return message.reply("Modmail already closed!");
            if(message.content.toLowerCase().startsWith('!del')) return require('../functions/transcript')(memberObj, message);
            return;
        } else {
            if(message.content.toLowerCase().startsWith('!close')) return closeChannel(memberObj, message, member, fileArr);
            if(message.content.toLowerCase().startsWith('!del')) return message.reply('Close the mail first, use `!close MESSAGE`');
            if(message.content.toLowerCase().startsWith('!r')) return member.send({content:'**__'+message.author.username+':__**\n'+message.content.split('!r')[1], files:fileArr}).then(()=>message.react(process.env.sentEmoji)).catch(e=>message.reply(e.stack))
        }
        
    }
}

function openChannel(memberObj, message, files){
    let channel = client.channels.cache.get(memberObj[0].channel)
    channel.edit({name: message.author.username, topic: "Opened - " + message.author.id})
    channel.send(`<@&${process.env.moderator}>, the ModMail is re-opened by <@${memberObj[0].user}>`)
    channel.send({content:'**__'+message.author.username+':__**\n'+message.content, files}).then(()=>message.react(process.env.sentEmoji))
    message.channel.send("ModMail opened! Wait for the staff to adress you! If you wish to close the modmail, use the command \`!close REASON\`.");
    memberObj[0].status = 1;
    let newData = mails.filter(e => e.user !== message.author.id)
    newData.push(memberObj[0])
    fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
        if(err) console.log(err)
    });
}

async function openMail(message, files){
    //Create  new channel
    const createdChannel = await guild.channels.create(
    message.author.username,
    {
        reason: "Recieved a DM from " + message.author.username,
        type: "GUILD_TEXT",
        topic: "Opened - " + message.author.id,
        parent: process.env.parentCategory
    })

    //Saving the opened modmail data
    mails.push({user: message.author.id, channel: createdChannel.id, status:1, messageAttachments: {}})
    fs.writeFileSync('./data/openedmails.json', JSON.stringify(mails), "utf-8", function(err){
        if(err) console.log(err)
    });
    console.log("New modmail opened")

    //informing the mods
    createdChannel.send(`<@&${process.env.moderator}>, a new ModMail Opened by <@${message.author.id}>\n
        A guide to use the modmail:\n
        • \`!close MESSAGE\` Close the modmail with a final message.\n
        • \`!r MESSAGE\` Reply to the user with a message. If your message gets reacted with ${process.env.sentEmoji} emoji, it means the message has reached.\n
        • \`!del\` Deletes the channel after saving the Transcript in logging channel.\n`)
    createdChannel.send({content:'\n__**'+message.author.username+':**__\n'+message.content, files}).then(()=>message.react(process.env.sentEmoji)).catch(e=>message.reply(e.stack))

    //informing the user
    message.author.send("ModMail opened! Wait for the staff to adress you! If you wish to close the modmail, use the command \`!close REASON\`.")
}

function closeChannel(memberObj, message, notify, files) {
    let channel = client.channels.cache.get(memberObj[0].channel);
    let member = guild.members.cache.get(memberObj[0].user)
    channel.edit({name: "Closed - " + member.user.username, topic: "Closed - " + memberObj[0].user}).then(message.reply("ModMail Closed!"));
    let content;
    let reason = message.content.split("!close")[1]
    if(reason) { content = `ModMail closed with the message:\n**${reason}**`; } else { content = "ModMail Closed" }
    notify.send({content, files}).then(()=>message.react(process.env.sentEmoji)).catch(e=>message.reply(e.stack));
    memberObj[0].status = 0;
    let newData = mails.filter(e => e.user !== memberObj[0].user)
    newData.push(memberObj[0])
    fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
        if(err) console.log(err)
    });
}
