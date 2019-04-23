var Discord = require('discord.io');
var logger = require('winston');
var auth = require('../auth.json');
var request = require("request");
var db = require('../db.js');
//var jQuery = require('jQuery');

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
        console.log(args.length);
        var cmd = args[0];
        var name;

        if (args.length == 4) {
            name = args[1] + "_" + args[2] + "_" + args[3];
            console.log(name);
        } else if (args.length == 3) {
            name = args[1] + "_" + args[2];
            console.log(name);
        } else if (args.length == 2) {
            name = args[1] + "_" + args[2];
            console.log(name);
        } else {
            name = args.splice(1);
        }
        switch (cmd) {
            // !ping
            case 'rank':
                var playerData = {
                    method: 'GET',
                    url: 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name + '?api_key=' + auth.lolToken
                }

                request(playerData, function (error, response, body) {
                    data = JSON.parse(body)
                    console.log(data);
                    if (data.id == null) {
                        bot.sendMessage({
                            to: channelID,
                            message: 'ERROR: Missing or invalid league username!'
                        });

                    } else {
                        var playerRankData = {
                            method: 'GET',
                            url: 'https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/' + data.id + '?api_key=' + auth.lolToken
                        }

                        request(playerRankData, function (error, response, body) {
//                            console.log(Object.keys(body).length);
                            if (Object.keys(body).length <= 2) {
                                var noRank = "insert into users (summonerName, summonerLevel, summonerId, tier, rank, playerId) values ( '" + data.name + "','" + data.summonerLevel + "','" + data.id + "','unranked','','')";
                                db.query(noRank, function (err, result) {
                                    console.log('successful');
                                })
                                bot.sendMessage({
                                    to: channelID,
                                    message: "there is currently no rank for: " + name.replace("_", " ")
                                });
                            } else {
                                rankData = JSON.parse(body)
                                console.log(rankData);
                                tier = rankData[0].tier
                                rank = rankData[0].rank

                                db.query("select summonerName from users where summonerName ='" + rankData[0].summonerName + "'", function (err, result) {
                                    if (err)
                                        throw err;
                                    var insVar = "insert into users (summonerName, summonerLevel, summonerId, tier, rank, playerId) values ( '" + rankData[0].summonerName + "','" + data.summonerLevel + "','" + rankData[0].summonerId + "','" + rankData[0].tier + "','" + rankData[0].rank + "','" + rankData[0].leagueId + "')";
                                    console.log(insVar);
                                    if (!result.length) {
                                        db.query(insVar, function (err, result) {
                                            console.log('successful');
                                        })
                                    }
                                })

                                bot.sendMessage({
                                    to: channelID,
                                    message: name.replace("_", " ") + ' your solo queue ranking is: ' + ' ' + tier.toLowerCase() + ' ' + rank
                                });
                            }
                        });
                    }
                });
                break;
            case 'csrRank' :
                var users = "select ranking.points, tierRanking.points, users.tier, users.rank, users.summonerName from users INNER JOIN ranking ON user.tier = ranking.color INNER JOIN users.rank = tierRanking.rankNumber";
                db.query(users, function (err, result) {
                    console.log('successful');
                    Object.keys(result).forEach(function(key) {
                        var row = result[key];
                        console.log(row.name)
                    });
                })
        }
    }
});



