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
        let site = options.branch;
        let param = context.param;
        for(let i in branch){
          if(context.param.toLowerCase().startsWith(`[${i}]`)){
            param = context.param.substring(i.length+2).trim();
            site = i;
          }
        }
        let res = await crom.searchPages(param, {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch]
        });
        if(!!res.data.searchPages.length){
          let ans = "";
          if(res.data.searchPages[0]){
            let page=res.data.searchPages[0];
            ans = page.wikidotInfo ? page.wikidotInfo.title : '' ;
            ans += ans && page.alternateTitles.length ? ' - ' : '';
            ans += page.alternateTitles.length ? page.alternateTitles[0].title : '';
            ans += !ans && page.translationOf && page.translationOf.wikidotInfo ? page.translationOf.wikidotInfo.title : '';
            ans += page.wikidotInfo ? `\n評分：${page.wikidotInfo.rating}` : '' ;
            ans += page.url ? `\n網址：${page.url}` : '';
          }
          if(res.data.searchPages.length>1){
            ans += `\n其它相近的结果：`;
            for(let i=1; i<res.data.searchPages.length-1; i++){
              ans += `${res.data.searchPages[i].wikidotInfo.title}, `;
            }
            ans += `${res.data.searchPages[res.data.searchPages.length-1].wikidotInfo.title}`;
          }

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
        context.reply(`用法： ${command} [分部代码(可选)]頁面標題`);
      }
    }, options);

    bridge.addCommand(commandSearchUser, async (context) => {
      if(context.param){
        let site = options.branch;
        let param = context.param;
        for(let i in branch){
          if(context.param.toLowerCase().startsWith(`[${i}]`)){
            param = context.param.substring(i.length+2).trim();
            site = i;
          }
        }
        if(context.param.toLowerCase().startsWith('[all]')){
          param = context.param.substring(5).trim();
          site = 'all';
        }
        let res = await crom.searchUsers(param, {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch],
          baseUrl: !!branch[site] ? branch[site] : branch[options.branch]
        });
        if (site&&site==="all") { filter.anyBaseUrl=null; filter.baseUrl=null; };
        if(!!res.data.searchUsers.length){
          let ans = "";
          if(res.data.searchUsers[0]){
            let user=res.data.searchUsers[0];
            ans = user.name;
            ans += `: ${(site==="all"||!!branch[site]) ? site.toUpperCase() : config.scpSite.toUpperCase()} #${user.statistics.rank}`;
            ans += `\n共 ${user.statistics.pageCount} 頁面，總評分 ${user.statistics.totalRating}，平均分 ${user.statistics.meanRating}`;
            ans += user.authorInfos.length ? `\n作者頁：${user.authorInfos[0].authorPage.url}` : '';
          }
          if(res.data.searchUsers.length>1){
            ans += `\n其它相近的结果：`;
            for(let i=1; i<res.data.searchUsers.length-1; i++){
              ans += `${res.data.searchUsers[i].name}, `;
            }
            ans += `${res.data.searchUsers[res.data.searchUsers.length-1].name}`;
          }
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
        context.reply(`用法： ${commandSearchUser} [分部代码(可选)]用戶名`);
      }
    }, options);

    bridge.addCommand(commandSearchUserByRank, async (context) => {
      if(context.param){
        let site = options.branch;
        let param = context.param;
        for(let i in branch){
          if(context.param.toLowerCase().startsWith(`[${i}]`)){
            param = context.param.substring(i.length+2).trim();
            site = i;
          }
        }
        if(context.param.toLowerCase().startsWith('[all]')){
          param = context.param.substring(5).trim();
          site = 'all';
        }
        let res = await crom.searchUserByRank(parseInt(param), {
          anyBaseUrl: !!branch[site] ? branch[site] : branch[options.branch],
          baseUrl: !!branch[site] ? branch[site] : branch[options.branch]
        });
        if (site&&site==="all") { filter.anyBaseUrl=null; filter.baseUrl=null; };
        if(!!res.data.usersByRank.length){
          let ans = "";
          if(res.data.usersByRank[0]){
            res=res.data.usersByRank[0];
            ans = res.name;
            ans += `: ${(site==="all"||!!branch[site]) ? site.toUpperCase() : config.scpSite.toUpperCase()} #${res.statistics.rank}`;
            ans += `\n共 ${res.statistics.pageCount} 頁面，總評分 ${res.statistics.totalRating}，平均分 ${res.statistics.meanRating}`;
            ans += res.authorInfos.length ? `\n作者頁：${res.authorInfos[0].authorPage.url}` : '';
          }
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
        context.reply(`用法： ${commandSearchUser} [分部代码(可选)]排名（數字）`);
      }
    }, options);
};
