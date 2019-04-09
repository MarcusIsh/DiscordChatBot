var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require("request");

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

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
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        
        
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'rank':
                 var playerData = {
                    method: 'GET',
                    url: 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ args + '?api_key=' + auth.lolToken
                }

                request(playerData, function (error, response, body) {
                    data = JSON.parse(body)
                    if(data.id == null){
                        bot.sendMessage({
                            to: channelID,
                            message:  'ERROR: Missing or invalid league username!'
                         });
                         
                    } else {
                        var playerRankData = {
                            method: 'GET',
                            url: 'https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/'+ data.id + '?api_key=' + auth.lolToken
                        }

                        request(playerRankData, function (error, response, body) {

                            rankData = JSON.parse(body)
                            tier = rankData[0].tier
                            rank = rankData[0].rank
                            bot.sendMessage({
                                to: channelID,
                                message:  args + ' your current ranking is: ' + ' ' + tier.toLowerCase() + ' ' + rank
                             });
                        });
                    }
                });
            
                
            break;
         }
     }
});

