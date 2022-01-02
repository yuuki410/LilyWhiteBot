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

const cs = ( (c) => {
  let ans = [];
  for(i in c){
    ans.push(i);
  }
  return ans;
})

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;

    let alias = options.alias || ['!h'];

    for(let command in alias){
      bridge.addCommand(alias[command], async (context) => {
        let res;
        if(context.param=="help"){
          context.reply(`用法：${alias[command]} [類型（可選）：${cs.join('|')}]`);
        } else if(context.param && cs.includes(context.param)){
          res = await got.get(`https://v1.hitokoto.cn/?c=${c[context.param]}`).json();
        } else {
          res = await got.get("https://v1.hitokoto.cn/").json();
        }
        context.reply(`${res.hitokoto} ——${res.from_who}《${res.from}》`);
      }, options);
    }
};
