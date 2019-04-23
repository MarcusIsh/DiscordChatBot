var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require("request");
var db = require('../db.js');
 
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
                    console.log(data);
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
                            console.log(rankData);
                            tier = rankData[0].tier
                            rank = rankData[0].rank
                            
                            db.query("select summonerName from users where summonerName ='" + rankData[0].summonerName + "'", function (err, result) {
                                if(err) throw err;
                                var insVar = "insert into users (summonerName, summonerLevel, summonerId, tier, rank, playerId) values ( '"+ rankData[0].summonerName +"','"+ rankData[0].summonerLevel +"','"+ rankData[0].summonerId+"','"+ rankData[0].tier +"','"+ rankData[0].rank +"','"+ rankData[0].leagueId +"')";
                                console.log(insVar);
                                if(!result) {
                                    db.query(insVar, function (err, result) {
                                        console.log('successful');
                                    })
                                }
                            })
                            
                            bot.sendMessage({
                                to: channelID,
                                message:  args + ' your solo queue ranking is: ' + ' ' + tier.toLowerCase() + ' ' + rank
                             });
                        });
                    }
                });
            break;
         }
     }
});

