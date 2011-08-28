(function(game) {
  
  function ClubController() {
    
  };
  
  ClubController.prototype = {
    key_mappings: { 83: 0, 68: 1, 70: 2, 74: 3, 75: 4, 76: 5 },
    playkeys: ['s', 'd', 'f', 'j', 'k', 'l'],
    numkeys: 6,
    
    player: null,
    vis: null,
    playing: false,
    readyToPlay: false,
    
    init: function() {
      var self = this;
      this.vis = new SongVis({
        container: 'vis',
        ratio: 0.03,
        lookahead: 1000,
        numkeys: 6,
        playkeys: this.playkeys
      });
      game.getActivePlayer(function(player_obj) {
        if (player_obj && (player_obj.id === game.player.id)) {
          game.active = true;
        }
        else {
          if(player_obj.performances && player_obj.performances[player_obj.performances.length-1]) {
            var perf = player_obj.performances[player_obj.performances.length-1];
            self.songLoaded(perf.song.id, perf.song, player_obj.id);
          }
        }
        club.resetPlayer(player_obj);
      });
      
      setInterval(function() {
        now.getAllPlayers(function(allPlayers) {
          var html = '';
          _(allPlayers).each(function(p, i) {
            if (i === 0) {
              html += '<li>' + p + ' (playing)</li>';
            }
            else {
              html += '<li>' + p + '</li>';
            }
          });
          $("#playerlist").html(html);
        })
      }, 5000);
    },
    
    songLoaded: function(id, songdata, player_id) {
      var self = this;
      
      $("#videoPlayer").html("")
      
      this.player = new YT.Player('videoPlayer', 
      {height: '390', width: '640', videoId: id, playerVars: {'start': 0, controls: '1'},
        events: {'onReady': onReady, 'onStateChange': onStateChanged} });
      
      self.vis.load_json(songdata);
      
      var self = this;
      
      this.readyToPlay = false;
      
      function onReady() {
        $('#club').addClass('stage');
        if (player_id === game.player.id) {
          game.startSong(player_id);
        }
        self.readyToPlay = true;
      }
      
      var states = {
        'unstarted': -1,
        'ended': 0,
        'playing': 1,
        'paused': 2,
        'buffering': 3
      }
      
      function onStateChanged(state) {
        self.playing = (state.data !== states.ended && state.data !== states.paused && state.data != states.unstarted);
        if(state.data === 0) {
          game.donePlaying();
        }
      }
      
    },
    
    initSong: function(id) {
      game.initSong(id);
    },
    
    startSong: function () {
      var t = 0, self = this;
      this.player.playVideo();
      var position;
      function update() {
        if(self.playing) {
          var position = self.time();
          $("#time").html(position);
          self.vis.seek(position);
        }
        setTimeout(update, 1000);
      }
      update();
      if(true) {
        this.initKeyPressListener()
      }
        $('#otherplayerstatus').text('playing');
    },
    
    time: function() {
      return Math.round((this.player.getCurrentTime() || 0) * 1000);
    },
    
    interval:null,
    initKeyPressListener: function() {
      $(document).keydown(_.bind(this.onKeyPress, this));
      $(document).keyup(_.bind(this.onKeyUp, this));
      var self = this;
      this.interval = window.setInterval(_.bind(function() {
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
        var keyhighlight = mapping;
        
        if (mapping > (self.numkeys / 2 - 1)) {
          keyhighlight++;
        }
        
        var time = this.time();
        
        $($('#vis .keyroll > div')[keyhighlight]).addClass('highlight');
        _.delay(_.bind(function() {
          $($('#vis .keyroll > div')[keyhighlight]).removeClass('highlight');
        }, this), 500);
        
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
    
    remoteKeyUpdated: function(err, key, dead, ms) {
      var self = this;
      if(typeof key == 'undefined' || key == null) {
        self.fuckup(0);
      }
      else {
        self.vis.activate_key(key);
      }
      
      for(var i in dead) {
        self.dead_key(dead[i]);
      }
      
      if(this.readyToPlay && !this.playing) {
        this.startSong();
      }
      
      if(ms > (this.time() + 1000) || ms < (this.time() - 1000) && this.playing) {
        this.player.seekTo(ms/1000);
      }
    },
    
    remoteStatusUpdated: function(err, dead, ms) {
      var self = this;
      for(var i in dead) {
        self.dead_key(dead[i]);
      }
      
      if(!this.playing && this.readyToPlay) {
        this.startSong();
      }
      
      if(ms > (this.time() + 1000) || ms < (this.time() - 1000) && this.playing) {
        this.player.seekTo(ms/1000);
      }
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
      
      var hottness = 100 - (streak + 50)
      if (hottness < 5) hotness = 5;
      if (hottness > 100) hotness = 100;
      $("#meter #mask").css("height", hottness + '%')
      
      this.streak = streak;
      var volume = Math.max(0, Math.min(100, 50 - (streak/-10) * 100));
      this.player.setVolume(volume);
      
      $("#volume_amount").html(volume);
      
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
      
      if(this.streak == -35) {
        this.player.stopVideo();
        game.donePlaying();
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
    },
    
    resetPlayer: function(player) {
      if(this.player) this.player.pauseVideo();
      $('#club').removeClass('stage');
      if(game.active) {
        $('#club').addClass('active');
      }
      else {
        $('#club').removeClass('active');
        $(document).unbind('keydown').unbind('keyup');
        if(this.interval) {
          window.clearInterval(this.interval);
        }
        $('#otherplayername').text(player.playername);
        $('#otherplayerstatus').text('choosing a song');
      }
    }
    
  };
  
  window.club = new ClubController();

  function onYouTubePlayerAPIReady() { };
})(game);