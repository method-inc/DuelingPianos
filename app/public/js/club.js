(function() {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    
    chooseSong: function(id) {
      $("#videoPlayer").html("")
      console.log('playing song ' + id);
      $('#club').addClass('stage');
      player = new YT.Player('videoPlayer', 
      {height: '390', width: '640', videoId: id, playerVars: {'start': 0, controls: '0'},
        events: {'onReady': onReady} });
      
      function onReady() {
      
        vis.load_song('/songdata/'+id+'.keys.json', function() {
          var t = 0;
          window.setTimeout(function() { player.playVideo(); }, 1000);
        
          function update() {
            var p = player.getCurrentTime() || 0;
            position = Math.round(p * 1000);
            $("#time").html(position);
            vis.seek(position);
            setTimeout(update, 1000);
          }
          update()
        });
      }
      
    }
    
  };
  
  window.club = new ClubController();
  
})();