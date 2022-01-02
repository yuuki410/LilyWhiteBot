/*
* Hitokoto.cn
*
* command: '!h'
* types: [
*     'qq/123456'
* ]
*/

'use strict';

const got = require('got');
const BridgeMsg = require('./transport/BridgeMsg.js');

const c = {
  "动画": "a",
  "漫画": "b",
  "游戏": "c",
  "文学": "d",
  "原创": "e",
  "网络": "f",
  "其他": "g",
  "影视": "h",
  "诗词": "i",
  "网易云": "j",
  "哲学": "k",
  "抖机灵": "l",
};

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;

    let alias = options.alias || ['!h'];

    for(let command in alias){
      bridge.addCommand(alias[command], async (context) => {
        let res;
        if(context.param.replace(' ','') == "help"){
          context.reply(`用法：${alias[command]} [類型（可選）：${Object.keys(c).join('|')}]`);
        } else {
          if(Object.keys(c).includes(context.param.replace(' ',''))){
            res = await got.get(`https://v1.hitokoto.cn/?c=${c[context.param]}`).json();
          } else {
            res = await got.get("https://v1.hitokoto.cn/").json();
          }

          let ans = `${res.hitokoto}${!!res.from_who || !!res.from ? `  ——${!!res.from_who ? res.from_who : ""}${!!res.from ? `《${res.from}》` : ""}` : ""}`;
          context.reply(ans);

          // 如果開啟了互聯，而且是在公開群組中使用本命令，那麼讓其他群也看見一言
          if (bridge && !context.isPrivate) {
            bridge.send(new BridgeMsg(context, {
                text: ans,
                isNotice: true,
            }));
          }
        }

      }, options);
    }
};
