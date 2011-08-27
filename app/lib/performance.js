var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var song_dir = global.app.set('app root') + '/public/songdata/';


//var song_dir = '/Users/hunter/skookum/app/public/songdata/';

exports = Performance;


function Performance(options) {
  this.player_id = options.player_id;
  this.range = options.range || 300;  // What range (in ms) must an acceptable key fall into?
  this.song = undefined;
  this.tips = 0;
  this.streak = 0;
  this.last_key_index = -1;
}

Performance.prototype = Object.create( EventEmitter.prototype );

 
// Client can tell the server to load a song for a performance
Performance.prototype.load_song = function(id, callback) {
  var self = this;
  fs.readFile(song_dir + id + '.keys.json', 'utf-8', function(err, data) {
    if (err) throw err;
    self.song = JSON.parse(data);
    // Initialize each key to an unpressed state
    self.song.keys.forEach(function(key) {
      key.available = true;
    });
    // Set the last key to nothing
    self.last_key_index = -1;
    return callback && callback();
  });
};

// Client can tell the server the user just pressed a key
Performance.prototype.press_key = function(pitch, ms) {
  // Find the next available keys
  var i = this.last_key_index + 1,
      keys = this.song.keys,
      furthest_ms = ms + this.range,
      key, key_ms;
  if (i >= keys.length) return;
  do {
    key = keys[i];
    key_ms = key.start;
    if (key.available && key.pitch === pitch) {
      // Key was correct (correct pitch within the allowed range of time)
      key.available = false;
      this.last_key_index = i;
      this.update_streak(1);
      return;
    }
  } while (key_ms < furthest_ms)
  // Key pressed doesn't have a match at that point in the song
  this.send_fuckup(pitch);
  this.update_streak(-1);
};

// Client can request the current state of this performance at any time
Performance.prototype.get_status = function() {
  return {
    player_id: this.player_id,
    tips: this.tips,
    streak: this.streak
  };
};

// Used internally
Performance.prototype.update_streak = function(delta) {
  if (this.streak >= 0) {
    if (delta > 0) this.streak += delta;
    else this.streak = delta;
  }
  else {
    if (delta < 0) this.streak += delta;
    else this.streak = delta;
  }
  send_streak();
};

// Server can tell the client the user fucked up
Performance.prototype.send_fuckup = function(pitch) {
  this.emit('fuckedUp', pitch);
};

// Server can tell the client to update to user's streak
Performance.prototype.send_streak = function() {
  this.emit('updatedStreak', this.streak);
};

// Server can tell the client to update the user's tips
Performance.prototype.send_tips = function() {
  this.emit('updatedTips', this.tips);
};


// Quick test

/*
var p = new Performance();

p.load_song('zuqJ1Q_px5k', function() {
console.log("song loaded:");
console.log(p.song);
});
*/