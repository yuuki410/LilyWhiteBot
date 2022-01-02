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

    bridge.addCommand(command, async (context) => {
      if (options.operators.includes(context.from_uid)) {
        await context.reply("開始重新啟動");
        process.exit();
      } else {
        context.reply(`您沒有操作員權限，当前的操作员是${options.operators.join(', ')}`);
      }
    }, options);
};
