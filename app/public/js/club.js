(function() {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    
    chooseSong: function(id) {
      console.log('playing song ' + id);
      $('#club').addClass('stage');
      player = new YT.Player('videoPlayer', 
      {height: '390', width: '640', videoId: id, playerVars: {'start': 0, controls: '0'} });
      
      vis.load_song('/songdata/'+id+'.keys.json', function() {
      
        window.setTimeout(function() { player.playVideo(); }, 1000);
        setInterval(function() {
          var p = player.getCurrentTime() || 0;
          position = Math.round(p * 1000);
          $("#time").html(position);
          vis.seek(position);
        }, 50);
      });
      
    }
    
  };
  
  window.club = new ClubController();
  
})();