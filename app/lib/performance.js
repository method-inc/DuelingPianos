var fs = require('fs');

//var song_dir = global.app.set('app root') + '/public/songdata/';

var song_dir = '/Users/hunter/skookum/app/public/songdata/';

function Performance() {
  this.song = undefined;
  this.tips = 0;
  this.streak = 0;
}

Performance.prototype = {
  // Client can tell the server to load a song for a performance
  load_song: function(id, callback) {
    var self = this;
    fs.readFile(song_dir + id + '.keys.json', 'utf-8', function(err, data) {
      if (err) throw err;
      self.song = JSON.parse(data);
      // Initialize each key to an unpressed state
      self.song.keys.forEach(function(key) {
        key.pressed = false;
      });
      callback();
    });
  },
  // Client can tell the server the user just pressed a key
  press_key: function(pitch, ms) {
    
  },
  // Server can tell the client the user fucked up
  send_fuckup: function(pitch) {
    
  },
  // Server can tell the client to update to user's streak
  send_streak: function(streak) {
    
  },
  // Server can tell the client to update the user's tips
  send_tips: function(tips) {
    
  }
};

exports = module.exports = Performance;

// Quick test

var p = new Performance();

p.load_song('zuqJ1Q_px5k', function() {
  console.log("song loaded:");
  console.log(p.song);
});