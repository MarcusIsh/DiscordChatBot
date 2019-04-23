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

        if (args.length == 5) {
            name = args[1] + "_" + args[2] + "_" + args[3];
            name = name.replace("_", " ");
            console.log(name);
        } else if (args.length == 4) {
            name = args[1] + "_" + args[2];
            name = name.replace("_", " ");
            console.log(name);
        } else if (args.length == 3) {
            name = args[1] + "_" + args[2];
            name = name.replace("_", " ");
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
                                var noRank = "insert into users (summonerName, summonerLevel, summonerId, tier, rank, playerId) values ( '" + data.name + "','" + data.summonerLevel + "','" + data.id + "','unranked','unranked','')";
                                db.query(noRank, function (err, result) {
                                    console.log('successful');
                                })
                                bot.sendMessage({
                                    to: channelID,
                                    message: "there is currently no rank for: " + name
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
                                    message: name + ' your solo queue ranking is: ' + ' ' + tier.toLowerCase() + ' ' + rank
                                });
                            }
                        });
                    }
                });
                break;
            case 'csrRank' :
                var users = "SELECT ranking.points as tierPoints, tierRanking.points as rankPoints, users.tier, users.rank, users.summonerName FROM users LEFT JOIN ranking ON users.tier = ranking.color LEFT JOIN tierRanking ON users.rank = tierRanking.rankNumber order BY ranking.points desc";
                var rankStr = "Sever Standings:\n\ ";
                
                db.query(users, function (err, result) {
                    console.log(result);
                    result.forEach(function(row){
                        var points = row.tierPoints + row.rankPoints;
                        if(row.tier == "unranked"){
                            rankStr += row.summonerName + ": rank -> " + row.tier + ", "+ points + "\n\ ";
                        } else {
                            rankStr += row.summonerName + ": rank -> " + row.tier + " " + row.rank +", "+ points + "\n\ ";     
                        }
                    });
                
                bot.sendMessage({
                    to: channelID,
                    message: rankStr
                });
            })
                break;
            case 'commands':
                bot.sendMessage({
                    to: channelID,
                    message: 'commands:\n\
!rank <username> -- shows users rank, adds userdata to database to be tracked\n\
!csrRank -- shows tracked users ranking. INFO: Points are added from tier(0 - 80, by 10s. 0 unranked, challenger 80) and rank(0 - 40, by 10s. 0 unranked, IV 40)'
                });
        }
    }
});



