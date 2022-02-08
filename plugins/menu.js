/*
* Menu
*
* command: '!menu'
* types: [
*     'qq/123456'
* ]
*/

'use strict';

const fs = require('fs');
const { query } = require('winston');
const BridgeMsg = require('./transport/BridgeMsg.js');
const { isFileExists } = require('../lib/util.js');

var dbConfig;
var operators;

var db = {
  'get': (number)=>{},
  'ls': (reg)=>{},
  'rm': (number)=>{},
  'push': (param)=>{},
};

const parseArg = (param)=>{
  if(/^\#[0-9]+$/g.test(param)){
    return parseInt(param);
  } else if(/^\/.*\/$/g.test(param)){
    return new RegExp(param.splice(1, param.length-1));
  } else {
    return param;
  }
};

const dbInit = {
  'json': async(dbConfig)=>{
    if(!isFileExists(dbConfig.file)){
      fs.writeFileSync(dbConfig.file, JSON.stringify([]));
    }
    db.get = (number)=>JSON.parse(fs.readFileSync(dbConfig.file))[number];
    db.rm = (number)=>{
      fs.writeFileSync(
        dbConfig.file,
        JSON.stringify(
          JSON.parse(fs.readFileSync(dbConfig.file)).splice(number, 1)
        )
      );
    };
    db.ls = (reg)=>{
      if(!Object.prototype.toString.call(reg)==='[object RegExp]'){
        reg = new RegExp(reg, 'gmu');
      }
      let ans = [];
      let i = 0;
      JSON.parse(fs.readFileSync(dbConfig.file)).forEach(element => {
        if(reg.test(element)){
          ans.push({
            'content': element.content,
            'from': element.from,
            'number': i,
          });
        }
        i++;
      });
      return ans;
    };
    db.push = (param, from)=>{
      JSON.parse(fs.readFileSync(dbConfig.file)).forEach(element =>{
        if(param==element.content){
          return true;
        }
      });
      fs.writeFileSync(
        dbConfig.file,
        JSON.stringify(
          JSON.parse(fs.readFileSync(dbConfig.file)).push({
            'content': param,
            'from': from,
          })
        )
      );
      return false;
    };
  },
  'sqlite': async(dbConfig)=>{
    throw new Error('// TODO');
  },
  'mysql': async(dbConfig)=>{
    throw new Error('// TODO');
  },
};

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;

    let commands = options.commands || ['!menu'];
    operators = options.operators || [];
    let dbType = options.database.type || 'json';
    dbConfig = options.database[dbType] || (()=>{
        throw new Error('menu database did not setted');
      })();

    dbInit[dbType](options.database[dbType]);
    
    commands.forEach(command => {
      bridge.addCommand(command, async (context) => {
        let res;
        let param = context.param.replace(/^\s*/, '');
        if(param.length==0 || param=='help'){
          context.reply(`Usage：${command} [get|ls|rm|push] <item>\n此功能會匹配消息中的菜單條目，考慮到性能問題，過長的消息不會被匹配`);
        } else {
          [
            {
              'cmd': 'get',
              'op': (param, context)=>{
                db.get(parseInt(param));
              },
            },
            {
              'cmd': 'ls',
              'op': (param, context)=>{
                db.ls(parseArg(param));
              }
            },
            {
              'cmd': 'rm',
              'op': (param, context)=>{
                let ans = [];
                db.ls(parseArg(param)).forEach(element=>{
                  if(element.from == context.from_uid || operators.includes(context.from_uid)){
                    db.rm(element.number);
                  } else {
                    ans.push('您不是操作員或您不是該項目的添加者');
                  }
                });
                return ans;
              }
            },
            {
              'cmd': 'push',
              'op': (param, context)=>{
                db.ls(param).forEach(element=>{
                  if(element.content == param){
                    return true;
                  }
                });
                db.push(param, context.from_uid);
                return false;
              }
            }
          ].forEach(cmd=>{
            if(param.startsWith(cmd.cmd)){
              let ans = cmd.op(param.substring(cmd.cmd.length), context);
              if(!ans || (Object.prototype.toString.call(ans) === '[object Array]' && ans.length==0)){
                ans=`操作成功`;
              }
              context.reply(ans);
              
              // 如果開啟了互聯，而且是在公開群組中使用本命令，那麼讓其他群也看見
              if (bridge && !context.isPrivate) {
                bridge.send(new BridgeMsg(context, {
                    text: ans,
                    isNotice: true,
                }));
              }
            }
          });
        }

      }, options);
    });
};
