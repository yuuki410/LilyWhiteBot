/*
* Search for SCP-Wiki
*
* command: '!page', '!user'
* types: [
*     'qq/123456'
* ]
*/

'use strict';

const CromApi = require('./scpper/crom.js');
const crom = new CromApi();
const BridgeMsg = require('./transport/BridgeMsg.js');

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
    let commandSearchUser = options.commandSearchUser || '!author';
    let commandSearchUserByRank = options.commandSearchUserByRank || '!rank';

    bridge.addCommand(command, async (context) => {
      if(context.param){
        let site = options.branch; // TODO: 允許按分部查詢
        let res = await crom.searchPages(context.param, {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch]
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
          
          // 如果開啟了互聯，而且是在公開群組中使用本命令，那麼讓其他群也看見掀桌
          if (bridge && !context.isPrivate) {
            bridge.send(new BridgeMsg(context, {
                text: `${ans}`,
                isNotice: true,
            }));
          }
        } else {
          context.reply("無結果");
        }
      } else {
        context.reply(`用法： ${command} 頁面標題`);
      }
    }, options);

    bridge.addCommand(commandSearchUser, async (context) => {
      if(context.param){
        let site = options.branch;
        let res = await crom.searchUsers(context.param, {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch],
          baseUrl: !!branch[site] ? branch[site] : branch[options.branch]
        });
        if (site&&site==="all") { filter.anyBaseUrl=null; filter.baseUrl=null; };
        let ans = "";
        if(res.data.searchUsers[0]){
          res=res.data.searchUsers[0];
          ans = res.name;
          ans += `: ${(site==="all"||!!branch[site]) ? site.toUpperCase() : config.scpSite.toUpperCase()} #${res.statistics.rank}`;
          ans += `\n共 ${res.statistics.pageCount} 頁面，總評分 ${res.statistics.totalRating}，平均分 ${res.statistics.meanRating}`;
          ans += res.authorInfos.length ? `\n作者頁：${res.authorInfos[0].authorPage.url}` : '';
        }
        if(!!ans){
          context.reply(ans);
          
          // 如果開啟了互聯，而且是在公開群組中使用本命令，那麼讓其他群也看見掀桌
          if (bridge && !context.isPrivate) {
            bridge.send(new BridgeMsg(context, {
                text: `${ans}`,
                isNotice: true,
            }));
          }
        } else {
          context.reply("無結果");
        }
      } else {
        context.reply(`用法： ${commandSearchUser} 用戶名`);
      }
    }, options);

    bridge.addCommand(commandSearchUserByRank, async (context) => {
      if(context.param){
        let site = options.branch;
        let res = await crom.searchUserByRank(parseInt(context.param), {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch],
          baseUrl: !!branch[site] ? branch[site] : branch[options.branch]
        });
        if (site&&site==="all") { filter.anyBaseUrl=null; filter.baseUrl=null; };
        let ans = "";
        if(res.data.usersByRank[0]){
          res=res.data.usersByRank[0];
          ans = res.name;
          ans += `: ${(site==="all"||!!branch[site]) ? site.toUpperCase() : config.scpSite.toUpperCase()} #${res.statistics.rank}`;
          ans += `\n共 ${res.statistics.pageCount} 頁面，總評分 ${res.statistics.totalRating}，平均分 ${res.statistics.meanRating}`;
          ans += res.authorInfos.length ? `\n作者頁：${res.authorInfos[0].authorPage.url}` : '';
        }
        if(!!ans){
          context.reply(ans);
          
          // 如果開啟了互聯，而且是在公開群組中使用本命令，那麼讓其他群也看見掀桌
          if (bridge && !context.isPrivate) {
            bridge.send(new BridgeMsg(context, {
                text: `${ans}`,
                isNotice: true,
            }));
          }
        } else {
          context.reply("無結果");
        }
      } else {
        context.reply(`用法： ${commandSearchUser} 排名（數字）`);
      }
    }, options);
};
