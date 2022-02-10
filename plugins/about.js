/*
 * 提供許可信息
 * 
 */
'use strict';

const winston = require('winston');
const BridgeMsg = require('./transport/BridgeMsg.js');

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;
    const plugins = pluginManager.config.plugins || [];

    const about = (context) => {
        context.reply(
`Lily White Bot 互聯機器人莉莉白${
    options.fork ? `\nForked from: ${options.fork}` : ''
}
源代碼: ${options.repository || '項目未設置，請聯繫bot所有者設置此項'}
許可協議: AGPL v3.0
許可文本: ${options.license || '項目未設置，請聯繫bot所有者設置此項'}
這大致意味着您在使用或修改其代碼時必需公開您的修改版本，詳情請參閱許可文本${
    plugins.length ? `\n已启用的插件（套件）及可用命令：
${  plugins.includes('about') ? `\nabout: 提供許可信息
    .help
    !about` : ''
}${ plugins.includes('transport') ? `\ntransport: 在不同的群組、平臺間傳遞消息` : ''
}${ plugins.includes('qqmultimsg') ? `\nqqmultimsg: 在其它平臺查詢qq合併轉發的消息` : ''
}${ plugins.includes('groupid-tg') ? `\ngroupid-tg: 在tg查詢群組ID` : ''
}${ plugins.includes('ircquery') ? `\nircquery: 獲取IRC頻道資訊
    !${ pluginManager.config.ircquery.prefix || 'irc' }topic
    !${ pluginManager.config.ircquery.prefix || 'irc' }name
    !${ pluginManager.config.ircquery.prefix || 'irc' }whois` : ''
}${ plugins.includes('irccommand') ? `\nirccommand: 使用IRC頻道的機器人指令
    !${ pluginManager.config.irccommand.prefix || 'irc' }command` : ''
}${ plugins.includes('pia') ? `\npia: 掀桌子
    !pia
    !mua
    !hug
    !eat
    !drink
    !hugmua
    !idk
    !kick
    !panic` : ''
}${ plugins.includes('linky') ? `\nlinky: 轉換[[]]和{{}}爲 Wiki 系統的連結
    會匹配所有消息內容` : ''
}${ plugins.includes('restart') ? `\nrestart: 重新啟動機器人
    ${ pluginManager.config.restart.command || '!restart' }` : ''
}${ plugins.includes('scpper') ? `\nscpper: 查詢SCP維基（默認分部：${ pluginManager.config.scpper.branch }）
    ${ pluginManager.config.scpper.command || '!search' } [分部代码]
    ${ pluginManager.config.scpper.commandSearchUser || '!author' } [分部代码]
    ${ pluginManager.config.scpper.commandSearchUserByRack || '!rank' }` : ''
}${ plugins.includes('hitokoto') ? `\nhitokoto: 一言（於其後加入help可獲取幫助）${ (()=>{
        if(pluginManager.config.hitokoto.alias){
            let ans = '';
            pluginManager.config.hitokoto.alias.forEach(element => {
                ans += `\n    ${element}`;
            });
            return ans;
        } else {
            return `\n    !h`
        }
    })() }` : ''
}${ plugins.includes('8ball') ? `\n8ball
    !8ball` : ''
}` : ''
}`);
    }
    ['.help', '!about'].forEach(element =>{
        bridge.addCommand(`.help`, about, options);
    });
};
