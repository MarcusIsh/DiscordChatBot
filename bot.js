var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var name = args[2];
        
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'rank':
//                var players = {
//                    method: 'GET',
//                    url: 'https://na1.api.riotgames.com/lol/',
//                    headers:
//                    {
//                        'Postman-Token': '2efa7b32-d53c-4897-812e-c685ce7047a9',
//                        'cache-control': 'no-cache',
//                        Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjYjBkY2IxMC1mNDI0LTAxMzYtMGNjMi0xOWQxZThiMmYzYzAiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTQ2ODA4NzYwLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6InJpdmFzLWJvdCJ9.5iE0fPD1qpZD25BQozUmjY3PxiVP3snH3e9Cvb87wjI',
//                        Accept: 'application/json',
//                        'Content-Type': 'application/vnd.api+json',
//                        'TRN-API-KEY': '6af93314-54a9-43e1-b63b-8b0b2e32aa85'
//                    }
//                };
                bot.sendMessage({
                   to: channelID,
                   message: 'This is your current ranking' + ' ' + args
                });
            break;
            // Just add any case commands if you want to..
         }
     }
});
