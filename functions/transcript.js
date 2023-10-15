const client = require("../index");
const Discord = require("discord.js");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();
const document = dom.window.document;
const fs = require("fs");
const attachmentJSON = require("../data/openedmails.json")
const css = require("../data/uris.json").css
const replySVG =  require("../data/uris.json").replySVG
const picSVG = require("../data/uris.json").picSVG

module.exports = async (memberObj, interaction) => {
    let messageCollection = new Discord.Collection(); //creating a collection
    let channelMessages = await interaction.channel.messages
                  .fetch({limit: 100})
                  .catch((err) => console.log(err)); //fetching messages
    messageCollection = messageCollection.concat(channelMessages);//adding messages to collection

     //Adding more messages to collection
    while (channelMessages.size > 0) {
        let lastMessageId = channelMessages.lastKey();
        channelMessages = await interaction.channel.messages
            .fetch({ limit: 100, before: lastMessageId })
            .catch((err) => console.log(err));
        messageCollection = messageCollection.concat(channelMessages);
    }

    const msgs = messageCollection.reverse();//correcting the order
    let html = document.createElement("html");//<html></html>
    let head = document.createElement("head");//<head></head>
    let body = document.createElement("body");//<body></body>

    let headInfo = `
    <title> ${interaction.channel.name} - Transcripts </title>
    <meta name="viewport" content="width=device-width, initial-scale=1" charset="utf-8">
    <link rel="stylesheet" href="${css}">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
    <script>
    window.onload = hljs.highlightAll();
   async function glow(event){
        let link = event.target.parentElement.href || event.target.parentElement.parentElement.href || event.target.parentElement.parentElement.parentElement.href || event.target.href
        let element = document.getElementById(link.split('#')[1]);
            element.style.backgroundColor = "hsl(222.86deg 6.67% 20.59%)";
        let light = 20.59
        while(light < 27) {
            light += 0.5
            await sleep(30)
            element.style.backgroundColor = \`hsl(222.86deg 6.67% \${light}%)\`
            event.target.onClick = "break";
        }
        while(light > 21){
            light -= 0.5
            await sleep(30)
            element.style.backgroundColor = \`hsl(222.86deg 6.67% \${light}%)\`
            event.target.onClick = "break";
        }
    }
    const sleep = (time) => new Promise(res => setTimeout(res, time));
    </script>
    `
    let parentContainer = document.createElement("div");//<div class = "parentContainer">All messages</div>
    parentContainer.className = "parent-container";

    let guildElement = document.createElement("div");//<div></div>
    guildElement.setAttribute("style", "width:90%; padding:10px");

    let guildImgCont = document.createElement("span");//<span><img>server icon</img></span>

    let guildTextCont = document.createElement("span");//<span class ="header">servernme</span>
    guildTextCont.className = "header";

    let guildText = document.createTextNode(interaction.guild.name);//text node of servername
    let guildImg = document.createElement("img");//<img>server icon</img

    let horizontalRule = document.createElement("hr")
        horizontalRule.className = "main"; //hr

    let serverIcon = interaction.guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/2.png?size=1024';
    guildImg.setAttribute("src", serverIcon); //setting source of server icon
    guildImg.setAttribute("style", "width:75px; border-radius:50%"); //setting style of server icon

    //Appending elements in Guild Element Container
    guildImgCont.appendChild(guildImg);
    guildTextCont.appendChild(guildText);
    guildElement.appendChild(guildImgCont);
    guildElement.appendChild(guildTextCont);
    //Server Heading done

    let channelCont = document.createElement("span"); //Channel name container
    channelCont.setAttribute("style", "font-weight: bold; margin-left: 20px"); //setting style
    let channelName = document.createTextNode(`# ${interaction.channel.name}`); //channel name textnode
    channelCont.appendChild(channelName); //appending channel name to container

    let HorRule = document.createElement("hr")
        HorRule.className = "main"; //another hr

    //Appending elements in Webpage
    html.appendChild(head); //head
    html.appendChild(body); //body
    head.innerHTML = headInfo;
    body.appendChild(guildElement); //server head in body
    body.appendChild(horizontalRule); //hr
    body.appendChild(channelCont); //channelname in body
    body.appendChild(HorRule); //another hr
    body.appendChild(parentContainer); //message container

msgs.forEach(async (msg) => { //Adding each message to html
    let messageContainer = document.createElement("div"); //<div class ="message-container">stors message</div>
    messageContainer.className = "message-container";
    messageContainer.id = msg.id;
    const msgAttach = msg.attachments; //Array of attachments

    let referenceContainer = document.createElement('span')
        referenceContainer.className = 'reply'
        if(msg.reference) {
            let referencedMessage = msgs.get(msg.reference.messageId);
            let x;
            let image;
            let tag = "";
            let color = "";
            let bot = "";
            let dest = "";
            let pic = "";
            if(!referencedMessage) {
                x = "*Original message was deleted*";
                image = replySVG;
                color = "white";
            } else {
            x = referencedMessage.content.replaceAll('\n', ' ');
            if(x==="") x = "*Click to see attachment*";

            dest = referencedMessage.id;
            referencedMessage.mentions.users.forEach((user) => {
                x = x.replace(`<@${user.id}>`, '<l class = \'mention\'>@'+user.username+'</l>')
            })
            referencedMessage.mentions.roles.forEach((role) => {
                x = x.replaceAll(`<@&${role.id}>`, '<l class = \'mention\'>@'+role.name+'</l>')
            })
            referencedMessage.mentions.channels.forEach((channel) => {
                x = x.replaceAll(`<#${channel.id}>`, '<l class = \'mention\'>#'+channel.name+'</l>')
            })
                if(!referencedMessage.author){ 
                image = 'https://cdn.discordapp.com/embed/avatars/1.png?size=1024'
                tag = 'Deleted User'
                color = "White"
            } else {
                image =  referencedMessage.author.displayAvatarURL()
                tag = referencedMessage.member.displayName || referencedMessage.author.username
                tag = "@" + tag
                    if ( referencedMessage.member ) {
                    let role = referencedMessage.member.roles.color
                    if (!role) color = "#ffffff"
                    else color = role.hexColor
                    } else color = "#ffffff"
                if(referencedMessage.author.bot) bot = '<span style="font-weight: bold; background: #5c68ee; padding: 0.05em 0.5em 0.1em 0.5em; font-size: 0.7em; border-radius: 0.3em; position:relative; top: -0.2em">BOT</span>'
            }
            if(referencedMessage.attachments.size > 0) pic = `<img src = "${picSVG}" style = "width: 1.5em; top: 0.3em; position: relative">`
            }
            let referencedContent = require('../functions/mdtoHTML')(x);
            let referencedText = `
            <a onclick = "glow(event)" href = "#${dest}"><img style ="top: 1em; position: relative;" src="https://cdn.discordapp.com/attachments/1156217464225546330/1158782641068314634/Arrow.svg?ex=651d7fee&is=651c2e6e&hm=d552867d43e6cb116fe20364e0a06767403157d142c91f3cbc27e08d134748f1&">
            <img src="${image}" class="reply"> ${bot}<span style = "color: ${color}; font-weight: bold">${tag}</span> ${referencedContent} ${pic}</a>
            `
            referenceContainer.innerHTML = referencedText;
            messageContainer.appendChild(referenceContainer);
        }
    let avatarDiv = document.createElement("div"); //div carrying avatar of message author
    avatarDiv.className = "avatar-container";

    let img = document.createElement("img"); //avatar image

    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, 
        timeZone: process.env.timeZone
      };
    let TIME = msg.createdAt.toLocaleString('en-US', options).replaceAll(',','');
    let IMAGE;
    let TAG;
    let COLOR;
    let BOT = "";
    if(!msg.author){ 
        IMAGE = 'https://cdn.discordapp.com/embed/avatars/1.png?size=1024'
        TAG = 'Deleted User'
        COLOR = "White"
    } else {
        IMAGE =  msg.author.displayAvatarURL()
        TAG = msg.member.displayName || msg.author.username
            if ( msg.member ) {
              let role = msg.member.roles.color
              if (!role) COLOR = "#ffffff"
              else COLOR = role.hexColor
            } else COLOR = "#ffffff"
        if(msg.author.bot) BOT = '<span style="background: #5c68ee; padding: 0.05em 0.5em 0.1em 0.5em; font-size: 0.7em; border-radius: 0.3em; position:relative; top: -0.2em">BOT</span>'
    }

    //setting image attributes and class
    img.setAttribute("src", `${IMAGE}`);
    img.className = "avatar";

    let nameElement = document.createElement("span"); //span for author name
    nameElement.setAttribute("style", "font-weight: bold; line-height:60%; font-size: 1.2em"); //styling author name

    let textContainer = document.createElement("div"); //container for message, name and time
    textContainer.className = "text";

    let name = `
    <span style="color: ${COLOR}">${TAG} </span>${BOT}<span style="color: #90979f; font-size: 0.8em; margin-left: 1em">${TIME}</span>
    `; //name and time text

    //Appending header in message container
    avatarDiv.appendChild(img);
    nameElement.innerHTML = name;
    messageContainer.appendChild(avatarDiv);
    textContainer.appendChild(nameElement);
    //done

    //Adding messages in textContainer
    let msgSpan = document.createElement('span')
    let x = msg.content;
    msg.mentions.users.forEach((user) => {
        x = x.replace(`<@${user.id}>`, '<l class = \'mention\'>@'+user.username+'</l>')
    })
    msg.mentions.roles.forEach((role) => {
        x = x.replaceAll(`<@&${role.id}>`, '<l class = \'mention\'>@'+role.name+'</l>')
    })
    msg.mentions.channels.forEach((channel) => {
        x = x.replaceAll(`<#${channel.id}>`, '<l class = \'mention\'>#'+channel.name+'</l>')
    })
    let msgTxt = require('./mdtoHTML')(x);
    msgSpan.innerHTML = msgTxt;
    
    textContainer.appendChild(msgSpan);
    messageContainer.appendChild(textContainer);
    let lineA = document.createElement("br"); //br
    let lineB = document.createElement("br"); //another br
    parentContainer.appendChild(messageContainer); //appending msgcontainer in parent container

    //Handling Attachments
    if (msgAttach.size > 0) {
        let attachmentObj = attachmentJSON.filter((e)=>e.channel == msg.channel);
        let urlArr = attachmentObj[0].messageAttachments[msg.id];
        if(!urlArr) {
            let err = document.createTextNode("\n Couldn't find Attachments")
            msgSpan.appendChild(err)
            exit;
        }
        let i = 0;
        msgAttach.forEach(async (attach) => {
            let theUrl = urlArr[i] || 'data:text;base2,Can\'t find the attachment cache';
            i++;
            if(!attach.contentType) attach.contentType = 'file';
            if(attach.contentType.startsWith('image')){
                let imgAnc = document.createElement("a"); //anchor element
                imgAnc.setAttribute("href", theUrl);
                imgAnc.setAttribute("target", "_blank");

                let imgAtt = document.createElement("img"); //img element
                let newLine1 = document.createElement("br"); //br
                let newLine2 = document.createElement("br"); //another br

                imgAtt.setAttribute("src", theUrl); //display image
                imgAtt.setAttribute("style", "max-width: 60%; max-height: 50vh; border-radius: 10px; margin-bottom: 1em");
                
                imgAnc.appendChild(imgAtt); //attach image in container
                msgSpan.appendChild(newLine1);
                msgSpan.appendChild(imgAnc); 
                msgSpan.appendChild(newLine2);
            } else if(attach.contentType.startsWith('video')){
                let videoElement = document.createElement("video"); //video element
                videoElement.controls = true; //enable controls
                videoElement.style["maxWidth"] = "60vw";
                videoElement.style["maxHeight"] = "50vh";
                videoElement.style["borderRadius"] = "10px";
                videoElement.style["marginBottom"] = "1em";

                let video = document.createElement("source"); //video source
                video.setAttribute("src", theUrl);
                video.setAttribute("type", attach.contentType);

                let newLine1 = document.createElement("br"); //br
                let newLine2 = document.createElement("br"); //another br

                videoElement.appendChild(video); //Attaching video in container
                msgSpan.appendChild(newLine1);
                msgSpan.appendChild(videoElement);
                msgSpan.appendChild(newLine2);
            } else if(attach.contentType.startsWith('audio')){
                let audioElement = document.createElement("audio"); //audio element
                audioElement.controls = true; //enabling controls
                audioElement.style["width"] = "60vw";
                audioElement.style["marginBottom"] = "1em";

                let audio = document.createElement("source"); //audio source
                audio.setAttribute("src", theUrl);
                audio.setAttribute("type", attach.contentType);

                let newLine1 = document.createElement("br"); //br
                let newLine2 = document.createElement("br"); //aother br

                audioElement.appendChild(audio); //Attaching audio in container
                msgSpan.appendChild(newLine1);
                msgSpan.appendChild(audioElement);
                msgSpan.appendChild(newLine2);
            } else {
                //Handling the display of filesize
                let fileSIZE = attach.size;
                let filesize;
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
                //done
                
                let UrL = theUrl.replace("media", "cdn").replace(".net", ".com"); //fixing url

                let fileElement = document.createElement("a"); //anchor element
                let fileDIV = document.createElement("div"); //div to store file data
                fileDIV.className = "file";

                let icon = document.createElement("img"); //file icon
                icon.setAttribute("src", "https://media.discordapp.net/attachments/1013028644572110948/1016063219363758180/1662318535119.png");
                icon.style["height"] = "42px";

                let fileNameCont = document.createElement("div"); //filename
                fileNameCont.setAttribute("style","vertical-align:5px; margin-left: 10px");

                let fileName = document.createTextNode(attach.name); //filename text
                let fileSize = document.createTextNode(filesize); //filesize text
                let nameBreak = document.createElement("br"); //br
                let sizeCont = document.createElement("span"); //filesize container
                sizeCont.style["color"] = "#949494";

                sizeCont.appendChild(fileSize); //appending file name and size in container
                fileNameCont.appendChild(fileName);
                fileNameCont.appendChild(nameBreak);
                fileNameCont.appendChild(sizeCont);

                fileElement.setAttribute("href", UrL); //setting file url
                fileElement.setAttribute("type", attach.contentType);

                let newLine1 = document.createElement("br"); //br
                let newLine2 = document.createElement("br"); //another br

                fileDIV.appendChild(icon); //appending icon and text in filediv
                fileDIV.appendChild(fileNameCont);
                fileElement.appendChild(fileDIV); //appending file in container
                msgSpan.appendChild(newLine1);
                msgSpan.appendChild(fileElement);
                msgSpan.appendChild(newLine2);
            }
        })
    }
    });
        let data = html.outerHTML;
        data = "<!DOCTYPE html>" + data
        let saved = Promise.resolve(
            fs.writeFileSync(
            `${interaction.channel.name.split('-')[1]}.html`,
            data,
            "utf8",
            function (err) {
                if (err) return console.log(err);
            }
            ))
        saved.then(()=>{
        interaction.channel.send('Transcripting and Deleting...'); //Notifying mods
        let trChannel = client.channels.cache.get(process.env.trChannel); //getting the target channel

        trChannel.send({
            files: [`./${interaction.channel.name.split('-')[1]}.html`],
            content: 'ModMail deleted by: '+interaction.author.username+'\n at: '+interaction.createdAt.toLocaleString('en-IN',{timezone:process.env.timeZone})
            }).then(()=> {
               interaction.channel.delete().then(()=>{
        const newData = attachmentJSON.filter(e => e.user !== memberObj[0].user)
        fs.writeFileSync('./data/openedmails.json', JSON.stringify(newData), "utf-8", function(err){
          if(err) console.log(err)
        });
    });
                console.log("Transcript sent")
                fs.unlinkSync(`${interaction.channel.name.split('-')[1]}.html`);
        })})
}