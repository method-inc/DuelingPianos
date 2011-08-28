var nowjs = require("now")
var Performance = require( GLOBAL.app.set('app root') + '/public/js/performance').Performance;

require('../../lib/uuidstuff');

exports = module.exports = function(server) {
  
  var everyone = nowjs.initialize(server);
  
  var game = {
    players: {},
    video_playing : false,
    triggered : false,
    timeout : false,
    clubs: {
      "The Stinky Squirrel":{ players: []}
    },
    
    rotateActivePlayer: function(club) {
      var old_active = this.clubs[club].players.shift();
      this.clubs[club].players.push(old_active);
      var self = this;
      
      this.triggered = true;
      this.video_playing = false;
      
      setTimeout(function() {
        everyone.now.newActivePlayer(club, self.clubs[club].players[0]);
        
        if (!self.timeout) {
          
          self.timeout = true;
          
          setTimeout(function() {
            if(!self.video_playing) {
              game.rotateActivePlayer(club);
              self.timeout = false;
            }
          }, 10000)
          
        }
        
      }, 1000);
    }
  }
  
  
  // get all players in game
  everyone.now.getAllPlayers = function(club, callback) {
    
    if (typeof club === "string") {
      var players = game.clubs[club].players;
    }
    else {
      callback = club;
      var players = [];
      for(var p in game.players) {
        players.push(game.players[p].playername)
      }
    }
    
    console.log(players)
    
    if (callback) callback(players);
  }
  
  // get active player
  everyone.now.getActivePlayer = function(club, callback) {
    var self = this;
    
    if(!game.triggered) {
      setTimeout(function() {
        console.log("running active player timeout")
        if(!game.video_playing) {
          console.log("taking too long, picking a new player");
          game.rotateActivePlayer(club);
        }
      }, 10000)
    }
    
    callback(game.clubs[club].players[0]);
  }
  
  // done playing
  everyone.now.donePlaying = function(player_id, club) {
    game.rotateActivePlayer(club);
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
        tips: 0,
        performances: []
      };
      
      game.players[player.id] = player;
    }
    
    // console.log(game.players);
    
    if (callback) callback(player);
  }
  
  // set a players name
  everyone.now.setName = function(id, value, callback) {
    
    game.players[id].playername = value;
    
    if (callback) callback(value)
  }
  
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
        console.log("New tip: $" + newtips)
        game.players[player_id].tips += newtips;
        
        for (var i = 0; i < game.clubs["The Stinky Squirrel"].players.length; i++) {
          var pl = game.clubs["The Stinky Squirrel"].players[i];
          if (pl.id == player_id) {
            console.log("updating tip")
            pl.tips += game.players[player_id].tips;
          }
        }
        
        console.log(game.clubs["The Stinky Squirrel"].players)
        
        
        everyone.now.updatedTips(player_id, newtips);
        everyone.now.totalTips(player_id, game.players[player_id].tips)
      }
    });
    
    perf.on('updatedStreak', function(player_id, streak) {
      everyone.now.updatedStreak(player_id, streak);
    });
    
    game.players[player_id].performances.push(perf);
    
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
  }
  
  // check status
  everyone.now.status = function(player_id, ms, callback) {
    if (game.players[player_id]) {
      game.players[player_id].performances[game.players[player_id].performances.length-1].status(ms, function(err, deadkeys, ms) {
        everyone.now.statusUpdated(err, deadkeys, ms, player_id);
      });
    }
  };
  
  // send a keypress
  everyone.now.keyPress = function(player_id, pitch, ms, callback) {
    game.players[player_id].performances[game.players[player_id].performances.length-1].press_key(pitch, ms, function(err, key, deadkeys, ms) {
      everyone.now.keyUpdated(err, key, deadkeys, ms, player_id);
    });
  };
  
  // set a players location
  everyone.now.setLocation = function(id, value, callback) {
    
    // grab player
    var player = game.players[id]
    
    // check if location is valid club
    if (game.clubs[value]) {
      
      // put player in club
      game.clubs[value].players.push(game.players[id]);
    }
    
    // not a club, remove from all clubs
    else {
      // for (var c in game.clubs) delete game.clubs[c].players[id]
    }
    
    if (callback) callback(value)
  }
  
}