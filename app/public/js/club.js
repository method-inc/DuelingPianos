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
      var self = this;
      window.setInterval(_.bind(function() {
        if(this.playing && this.time() > (this.last_keypress + 1000)) {
          game.status(this.time(), function(err, res) {
            for(var i in res) {
              self.dead_key(res[i]);
            }
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
        
        game.keyPress(mapping, time, function(err, key, dead) {
          if(typeof key == 'undefined' || key == null) {
            self.fuckup(mapping);
          }
          else {
            self.vis.activate_key(key);
          }
          
          for(var i in dead) {
            self.dead_key(dead[i]);
          }
        });
      }
    },
    onKeyUp: function(e) {
      if(this._keys_down[e.which]) delete this._keys_down[e.which];
    },
    
    dead_key: function(k) {
      this.vis.kill_key(k);
    },
    
    fuckup: function(chord) {
      var a = document.getElementById('fuckup_chord'+chord);
      a.currentPosition = 0;
      a.volume = 1;
      a.play();
    },
    
    updateTips: function(tips) {
      $("#tip_amount").html(tips);
    },
    
    streak: 0,
    updateStreak: function(streak) {
      $("#streak_amount").html(streak);
      this.streak = streak;
      if(this.streak < 0) {
        this.player.setVolume( 100 - (streak/-25)*100 );
      }
      else {
        this.player.setVolume( 100 );
      }
      if(this.streak == -12) {
        var a = document.getElementById('boo_1');
        a.currentPosition = 0;
        a.volume = 1;
        a.play();
      }
      if(this.streak == -28) {
        var a = document.getElementById('boo_2');
        a.currentPosition = 0;
        a.volume = 1;
        a.play();
      }
      
      if(this.streak == 18) {
        var a = document.getElementById('cheer_1');
        a.currentPosition = 0;
        a.volume = 1;
        a.play();
      }
      
      if(this.streak == 35) {
        var a = document.getElementById('cheer_2');
        a.currentPosition = 0;
        a.volume = 1;
        a.play();
      }
    }
    
  };
  
  window.club = new ClubController();

  function onYouTubePlayerAPIReady() { };
})(game);