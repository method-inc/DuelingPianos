var nowjs = require("now")

require('../../lib/uuidstuff');

exports = module.exports = function(server) {
  
  var everyone = nowjs.initialize(server);
  
  var game = {
    players: {},
    clubs: {
      "The Stinky Squirrel":{ players: {}, spectators: {} }
    }
  }
  
  
  // get all players in game
  everyone.now.getAllPlayers = function(callback) {
    
    var players = [];
    
    for(var p in game.players) {
      players.push(game.players[p].playername)
    }
    
    callback(players);
  }
  
  // get player by id
  everyone.now.getPlayer = function(id, callback) {
    
    var id = id || null;
    
    // check if player already exists
    if (game.players[id]) {
      console.log("getting existing player")
      var player = game.players[id];
    }
    
    // make new player
    else {
      console.log("creating new player")
      var player = {
        id:Math.uuidFast(),
        playername:'Mr. Anonymous',
        score: 0
      };
      game.players[player.id] = player;
    }
    
    console.log(game.players);
    
    if (callback) callback(player);
  }
  
  // set a players name
  everyone.now.setName = function(id, value, callback) {
    
    game.players[id].playername = value;
    
    if (callback) callback(value)
  }
  
  // set a players location
  everyone.now.setLocation = function(id, value, callback) {
    
    // grab player
    var player = game.players[id]
    
    // check if location is valid club
    if (game.clubs[value]) {
      
      // put player in club
      game.clubs[value].players[id] = game.players[id]
    }
    
    // not a club, remove from all clubs
    else {
      for (var c in game.clubs) delete game.clubs[c].players[id]
    }
    
    if (callback) callback(value)
  }
  
}