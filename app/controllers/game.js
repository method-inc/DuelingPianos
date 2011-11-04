var nowjs = require("now"),
    client,
    game,
    everyone;
var Performance = require( GLOBAL.app.set('app root') + '/public/js/performance').Performance;

var song_picking_timer;

require('../../lib/uuidstuff');

var Game = function() {};


exports = module.exports = new Game();

Game.prototype.init = function(server, options) {
  client = server.set('redisClient');
  everyone = nowjs.initialize(server);
  game = this.buildGame();

  var self = this;

  client.get("players", function(err, players){
    if (!err && players) {
      game.players = JSON.parse(players);
      console.log("players found in redis:", game.players);
    } else {
      console.log("no players found");
    }

    self.addNowjsFunctions();

  });
};

Game.prototype.buildGame = function() {
  return {
    players: {},
    video_playing : false,
    lastUpdate: new Date(),
    clubs: {
      "The Stinky Squirrel":{ players: []}
    },
    
    rotateActivePlayer: function(club, timedout) {
      var old_active = this.clubs[club].players.shift(),
          self = this;
      
      if (timedout !== true) {
        this.clubs[club].players.push(old_active);
      }
      
      setTimeout(function() {
        everyone.now.newActivePlayer(club, self.clubs[club].players[0]);
        
        if (!self.timeout) {
          
          self.timeout = true;
          
          setTimeout(function() {
            if(!self.video_playing) {
              game.rotateActivePlayer(club, false);
              self.timeout = false;
            }
          }, 10000);
          
        }
        
      }, 1000);
    }
  };
};


/**
 * setup now.js functions
 */
Game.prototype.addNowjsFunctions = function() {
    
  // get all players in game
  everyone.now.getAllPlayers = function(club, callback) {
    
    var players = [];

    if (typeof club === "string") {
      players = game.clubs[club].players;
    }
    else {
      callback = club;
      for(var p in game.players) {
        players.push(game.players[p].playername);
      }
    }

    if (callback) callback(players);
  };

  // get active player
  everyone.now.getActivePlayer = function(club, callback) {
    callback(game.clubs[club].players[0]);
  };

  // done playing
  everyone.now.donePlaying = function(player_id, club) {
    game.rotateActivePlayer(club);
  };

  // get player by id
  everyone.now.getPlayer = function(id, callback) {
    
    id = id || null;
    var player = {};
    
    // check if player already exists
    if (game.players[id]) {
      console.log("getting existing player");
      player = game.players[id];
    }
    
    // make new player
    else {
      console.log("creating new player");
      player = {
        id:Math.uuidFast(),
        playername:'Mr. Anonymous',
        tips: 0,
        performances: []
      };
      
      game.players[player.id] = player;
    }
    
    client.set("players", JSON.stringify(game.players), function(err, result) {
      if (callback) callback(player);  
    });
  };

  // set a players name
  everyone.now.setName = function(id, value, callback) {
    
    game.players[id].playername = value;
    
    if (callback) callback(value);
  };

  // load a song
  everyone.now.loadSong = function(player_id, song_id) {
    console.log("SERVER player_id" + player_id);
    var perf = new Performance({ player_id: player_id, numkeys: 6 });

    // create event listeners
    perf.on('fuckedUp', function(player_id, pitch) {
      everyone.now.fuckedUp(player_id, pitch);
    });
    
    perf.on('updatedTips', function(player_id, newtips) {
      if (newtips > 0) {
        game.players[player_id].tips += newtips;
        
        for (var i = 0; i < game.clubs["The Stinky Squirrel"].players.length; i++) {
          var pl = game.clubs["The Stinky Squirrel"].players[i];
          if (pl && pl.id == player_id) {
            pl.tips += game.players[player_id].tips;
          }
        }

        everyone.now.updatedTips(player_id, newtips);
        everyone.now.totalTips(player_id, game.players[player_id].tips);
      }
    });
    
    perf.on('updatedStreak', function(player_id, streak) {
      everyone.now.updatedStreak(player_id, streak);
    });
    
    if (game.players[player_id]) {
      game.players[player_id].performances.push(perf);
    }
    
    var numperfs = game.players[player_id].performances.length;
    
    game.players[player_id].performances[numperfs - 1].load_song(song_id, function(err, songdata) {
      console.log("player_id is now" + player_id);
      everyone.now.songLoaded(song_id, songdata, player_id);
    });
  };

  // broadcast the start of the song
  everyone.now.startSong = function(player_id) {
    game.video_playing = true;
    everyone.now.songStarted(player_id);
    // song_picking_timer.clearInterval();
  };

  // check status
  everyone.now.status = function(player_id, ms, callback) {
    
    console.log("logging activity");
    game.lastUpdate = new Date();

    var performance = game.players[player_id].performances[game.players[player_id].performances.length-1];
    if (performance){
      game.players[player_id].performances[game.players[player_id].performances.length-1].status(ms, function(err, deadkeys, ms) {
        everyone.now.statusUpdated(err, deadkeys, ms, player_id);
      });
    }
  };

  // send a keypress
  everyone.now.keyPress = function(player_id, pitch, ms, callback) {
    var performance = game.players[player_id].performances[game.players[player_id].performances.length-1];
    if (performance){
      performance.press_key(pitch, ms, function(err, key, deadkeys, ms) {
        everyone.now.keyUpdated(err, key, deadkeys, ms, player_id);
      });
    }
    else {
      console.log("couldn't find performance");
      console.log(game.players[player_id]);
    }
  };

  // set a players location
  everyone.now.setLocation = function(id, value, callback) {
    
    // grab player
    var player = game.players[id];
    
    // check if location is valid club
    if (game.clubs[value]) {
      
      // put player in club
      game.clubs[value].players.push(game.players[id]);
    }
    
    // not a club, remove from all clubs
    else {
      // for (var c in game.clubs) delete game.clubs[c].players[id]
    }
    
    if (callback) callback(value);
  };
};


