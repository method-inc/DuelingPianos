(function() {
  
  function GameController() {

  };
  
  GameController.prototype = {
    
    // player object
    player: {},
    
    performance: null,
    
    active: false,
    
    // Called when a player presses a key during song play 
    keyPress: function(pitch, ms, callback) {
      if(this.active) {
        // use local scoring algorithm if local player is playing
        this.performance.press_key(pitch, ms, callback);
        // send the performance to the server to sync with other players
        now.keyPress (this.player.id, pitch, ms)
      }
    },
    
    // Called when no action has been taken by the user during a song for 1 second
    status: function(ms, callback) {
      if(this.active) {
        // use local scoring algorithm if local player is playing
        this.performance.status(ms, callback);
        // send the performance to the server to sync with other players
        now.status(this.player.id, ms)
      }
    },
    
    initSong: function(song_id) {
      now.loadSong(this.player.id, song_id);
    },
    
    startSong: function(callback) {
      now.startSong(this.player.id);
    },
    
    setLocation: function(location) {
      now.setLocation(this.player.id, location);
    },
    
    donePlaying: function(club) {
      console.log('done playing')
      if (!club) club = "The Stinky Squirrel";
      now.donePlaying(this.player.id, club);
    }
    
  };
  
  window.game = new GameController();
  
})();

function isPLayer(id) {
  return game.player.id === id;
}

now.songStarted = function(player_id) {
  club.startSong(player_id);
}

now.keyUpdated = function (err, key, dead, ms, player_id) {
  if(!isPLayer(player_id) ) {
    club.remoteKeyUpdated(err, key, dead, ms);
  }
}

now.newActivePlayer = function(club, player) {
  console.log(player);
  game.active = isPLayer(player.id);
  club.resetPlayer();
}

now.updatedTips = function (player_id, tips) {
  club.updateTips(tips);
}

now.totalTips = function (player_id, tips) {
  club.updateTips(tips);
}

now.updatedStreak = function (player_id, streak) {
  club.updateStreak(streak);
}

now.status = function(player_id, time) {
  club.status(time);
}

now.songLoaded = function(id, songdata, player_id) {
  game.performance = new Performance.Performance({ player_id: game.player.id, numkeys: 6 });
  game.performance.load_json(songdata);
  club.songLoaded(id, songdata, player_id);
}

now.ready(function(){
  var playerid = amplify.store("playerid");
  
  // get player from server and put into local object
  now.getPlayer(amplify.store("playerid"), function(player){
    
    game.player = player
    amplify.store("playerid", player.id)
    $("#playername").val(player.playername);
  
    // listen for new name inputs
    $("#playername").keyup(function(){
    
      // grab new name from input box
      var name = $(this).val();
    
      // update server player object with new name
      now.setName(game.player.id, name, function(newname){
        game.player.name = name;
      })
    })
  })
})