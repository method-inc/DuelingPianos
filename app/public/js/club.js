(function() {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    key_mappings: { 65: 0, 83: 1, 68: 2, 74: 3, 75: 4, 76: 5 },
    
    player: null,
    vis: null,
    init: function() {
      this.vis = new SongVis({
        container: 'vis',
        ratio: 0.03,
        lookahead: 1300
      });
    },
    
    chooseSong: function(id) {
      $("#videoPlayer").html("")
      this.player = new YT.Player('videoPlayer', 
      {height: '390', width: '640', videoId: id, playerVars: {'start': 0, controls: '0'},
        events: {'onReady': onReady} });
      
      var self = this;
      function onReady() {
        if(self.vis) {
          self.vis.load_song('/songdata/'+id+'.keys.json', function() {
            
            $('#club').addClass('stage');

            var t = 0;
            window.setTimeout(function() { self.player.playVideo(); }, 1000);
            var position;
            function update() {
              var p = self.player.getCurrentTime() || 0;
              position = Math.round(p * 1000);
              $("#time").html(position);
              self.vis.seek(position);
              setTimeout(update, 1000);
            }
            update();
          });
        }
        this.initKeyPressListener();
      }
    },
    
    initKeyPressListener: function() {
      $(document).keydown(_.bind(this.onKeyPress, this));
    },
    
    onKeyPress: function(e) {
      if(e.keyCode in this.key_mappings) {
        console.log('pressed key ' + this.key_mappings[e.keyCode]);
        $($('#vis .keyroll > div')[this.key_mappings[e.keyCode]]).addClass('highlight');
        _.delay(_.bind(function() {
          $($('#vis .keyroll > div')[this.key_mappings[e.keyCode]]).removeClass('highlight');
        }, this), 750);
      }
    }
    
  };
  
  window.club = new ClubController();

  function onYouTubePlayerAPIReady() { };
})();