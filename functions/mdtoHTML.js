const md = require('markdown-it')({
    linkify: true,
    breaks: true
  });
function toHTML(markdownText){
const regexUl = /__(.*?)__/g;
const regexLtag = /&lt;l(.*?)&gt;/g;
let x = markdownText.split('\n')
    let text = "";
    x.forEach((e, i)=>{
        if (i === 0) return text += e
        if(!e.startsWith('>') && x[i-1].startsWith('>')) return text += "\n\n" + e
        return text += "\n" + e
    })
let newMarkdown = text
                .replace(regexUl, '<l class = \'underline\'>$1</l>')

let htmlText = md.render(newMarkdown);
let newHTML = htmlText
                .replaceAll(regexLtag,'<l$1>')
                .replaceAll('&lt;/l&gt;','</l>')
                .replaceAll('<h4>','<p>####')
                .replaceAll('<h5>','<p>#####')
                .replaceAll('<h6>','<p>######')
                .replaceAll('</h4>','</p>')
                .replaceAll('</h5>','</p>')
                .replaceAll('</h6>','</p>')
return newHTML;
}

module.exports = toHTML;
/*{
        "user": "819800139485020160",
        "channel": "1157638481795887174",
        "status": 0,
        "messageAttachments": {
            "1157943813478817894": [
                "https://cdn.discordapp.com/attachments/1156217464225546330/1157943869636366367/WIN_20230926_20_07_14_Pro.mp4?ex=651a72c4&is=65192144&hm=2b1f26550154d9860791c4da7f183e319a7cb5981b0e29d7abb729ec29f50146&",
                "https://cdn.discordapp.com/attachments/1156217464225546330/1157943870198382652/ink.png?ex=651a72c4&is=65192144&hm=3998b517a5e72adda8c1976827c7e0c8f26522e1da059d65ed2882d9f7425c59&",
                "https://cdn.discordapp.com/attachments/1156217464225546330/1157943870458450020/Screenshot_2023-09-29_133456.png?ex=651a72c4&is=65192144&hm=bd74f66e814c645e09b4123f7e6b27baa113ac3155af7beb150abfba2255605a&",
                "https://cdn.discordapp.com/attachments/1156217464225546330/1157943870638784522/Mangekyou_Sharingan.ico?ex=651a72c4&is=65192144&hm=fb5d5b3dad46e72c7eec12172a881b6ea727d31540fa458d0667a0ee017231b3&"
            ]
        }
    }*/