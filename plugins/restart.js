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
    let timeout = options.timeout || 15;

    bridge.addCommand(command, async (context) => {
      if (!!operators.length && !operators.includes(context.from_uid)) {
        context.reply(`您沒有操作員權限，当前的操作员是${operators.join(', ')}`);
      } else {
        context.reply(`${timeout}秒後開始重新啟動`);
        setTimeout(()=>process.exit(0), timeout * 1000);
      }
    }, options);
};
