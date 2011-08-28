(function() {
  
  function GameController() {

  };
  
  GameController.prototype = {
    
    // player object
    player: {},
    
    keyPress: function(pitch, ms, callback) {
      now.keyPress (this.player.id, pitch, ms, callback)
    },
    
    status: function(ms, callback) {
      now.status (this.player.id, ms, callback)
    },
    
    loadSong: function(song_id, callback) {
      now.loadSong(this.player.id, song_id, callback)
    }
    
  };
  
  window.game = new GameController();
  
})();

function isPLayer(id) {
  return game.player.id === id;
}

now.fuckedUp = function (player_id, pitch) {
  if (isPLayer()) {
    //console.log("you fucked up!")
  }
}

now.updatedTips = function (player_id, tips) {
  if (isPLayer()) {
    club.updateTips(tips);
  }
}

now.totalTips = function (player_id, tips) {
  if (isPLayer()) {
    club.updateTips(tips);
  }
}

now.updatedStreak = function (player_id, streak) {
  if (isPLayer()) {
    club.updateStreak(streak);
  }
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