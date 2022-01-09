/*
* Restart 
*
* command: '!restart', '!stop'
* operators: [
*     'qq/123456',
*     'irc/operator'
* ]
*/

'use strict';

module.exports = (pluginManager, options) => {
    const bridge = pluginManager.plugins.transport;

    let command = options.command || '!restart';
    let operators = options.operators || [];

    bridge.addCommand(command, async (context) => {
      if (operators.length && !options.operators.includes(context.from_uid)) {
        context.reply(`您沒有操作員權限，当前的操作员是${options.operators.join(', ')}`);
      } else {
        context.reply("15秒後開始重新啟動");
        setTimeout(()=>process.exit(0), 15000);
      }
    }, options);
};
