(function() {
  
  function GameController() {

  };
  
  GameController.prototype = {
    
    // player object
    player: {}
    
  };
  
  window.game = new GameController();
  
})();


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