/*
* Search for SCP-Wiki
*
* command: '!page', '!user'
* types: [
*     'qq/123456'
* ]
*/

'use strict';

const format = require('string-format');
const CromApi = require('./scpper/crom.js');
const crom = new CromApi();

const branch = {
  "wl": "http://wanderers-library.wikidot.com",
  "en": "http://scp-wiki.wikidot.com",
  "ru": "http://scp-ru.wikidot.com",
  "ko": "http://scpko.wikidot.com",
  "ja": "http://scp-jp.wikidot.com",
  "jp": "http://scp-jp.wikidot.com",
  "fr": "http://fondationscp.wikidot.com",
  "es": "http://lafundacionscp.wikidot.com",
  "th": "http://scp-th.wikidot.com",
  "pl": "http://scp-pl.wikidot.com",
  "de": "http://scp-wiki-de.wikidot.com",
  "cn": "http://scp-wiki-cn.wikidot.com",
  "it": "http://fondazionescp.wikidot.com",
  "pt": "http://scp-pt-br.wikidot.com",
  "cs": "http://scp-cs.wikidot.com",
  "cz": "http://scp-cs.wikidot.com",
  "int": "http://scp-int.wikidot.com"
};

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;

    let command = options.command || '!search';

    bridge.addCommand(command, async (context) => {
      if(context.param){
        let site = options.branch; // TODO: 允許按分部查詢
        let res = await crom.searchPages(context.param, {
          anyBaseUrl: !!site&&!!branch[site] ? branch[site] : branch[options.branch]
        });
        let ans = "";
        if(res.data.searchPages[0]){
          res=res.data.searchPages[0];
          ans = res.wikidotInfo ? res.wikidotInfo.title : '' ;
          ans += ans && res.alternateTitles.length ? ' - ' : '';
          ans += res.alternateTitles.length ? res.alternateTitles[0].title : '';
          ans += !ans && res.translationOf && res.translationOf.wikidotInfo ? res.translationOf.wikidotInfo.title : '';
          ans += res.wikidotInfo ? `\n評分：${res.wikidotInfo.rating}` : '' ;
          ans += res.url ? `\n網址：${res.url}` : '';
        }
        if(!!ans){
          context.reply(ans);
        } else {
          context.reply("無結果");
        }
      } else {
        context.reply(`用法： ${command} 頁面標題`);
      }
    }, options);
};
