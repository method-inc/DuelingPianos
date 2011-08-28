(function(game) {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    key_mappings: { 65: 0, 83: 1, 68: 2, 74: 3, 75: 4, 76: 5 },
    
    player: null,
    vis: null,
    playing: false,
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
        events: {'onReady': onReady, 'onStateChange': onStateChanged} });
      
      var self = this;
      function onReady() {
        if(self.vis) {
          game.loadSong(id, function() {
            
            self.vis.load_song('/songdata/'+id+'.keys.json', function() {
              $('#club').addClass('stage');
              var t = 0;
              window.setTimeout(function() { self.player.playVideo(); }, 1000);
              var position;
              function update() {
                var position = self.time();
                $("#time").html(position);
                self.vis.seek(position);
                setTimeout(update, 1000);
              }
              update();
            });
            
          });
        }
        self.initKeyPressListener();
      }
      
      function onStateChanged(state) {
        if(state.data == 1) self.playing = true;
        else self.playing = false;
        console.log(self.playing);
      }
      
    },
    
    time: function() {
      return Math.round((this.player.getCurrentTime() || 0) * 1000);
    },
    
    initKeyPressListener: function() {
      $(document).keydown(_.bind(this.onKeyPress, this));
      $(document).keyup(_.bind(this.onKeyUp, this));
      window.setInterval(_.bind(function() {
        if(this.playing && this.time() > (this.last_keypress + 1000)) {
          console.log('sending status')
          game.status(this.time(), function(err, res) {
            console.log('status callback');
            console.log(err, res);
          });
        }
      }, this), 1000);
    },
    
    last_keypress: -1,
    // keep track of which keys are down to prevent repeating key events before the key is released
    _keys_down: {},
    onKeyPress: function(e) {
      var self = this;
      if(this.playing && !(e.which in this._keys_down) && (e.which in this.key_mappings)) {
        this._keys_down[e.which] = true;
        var mapping = this.key_mappings[e.which];
        var time = this.time();
        
        $($('#vis .keyroll > div')[this.key_mappings[e.which]]).addClass('highlight');
        _.delay(_.bind(function() {
          $($('#vis .keyroll > div')[this.key_mappings[e.which]]).removeClass('highlight');
        }, this), 750);
        
        this.last_keypress = time;
        
        game.keyPress(mapping, time, function(err, res) {
          if(err) {
            self.fuckup(mapping);
            for(var i in res) {
              self.vis.kill_key(res[i]);
            }
          }
          else self.vis.activate_key(res);
        });
      }
    },
    onKeyUp: function(e) {
      if(this._keys_down[e.which]) delete this._keys_down[e.which];
    },
    
    _handleStatusCallback: function(err, res) {
      if(err) {
        self.fuckup(mapping);
        for(var i in res) {
          self.vis.kill_key(res[i]);
        }
      }
      else self.vis.activate_key(res);
    },
    
    fuckup: function(chord) {
      var a = document.getElementById('fuckup_chord'+chord);
      a.currentPosition = 0;
      a.play();
    }
    
  };
  
  window.club = new ClubController();

  function onYouTubePlayerAPIReady() { };
})(game);