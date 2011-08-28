var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var song_dir = GLOBAL.app.set('app root') + '/public/songdata/';


//var song_dir = '/Users/hunter/skookum/app/public/songdata/';


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

// Client can tell the server where they are (in ms) during playback (periodically)
Performance.prototype.status = function(ms, callback) {
  var i = this.last_key_index + 1, deadkeys = [];
  var past_boundary_ms = ms - this.range;
  while (this.song.keys[i] && this.song.keys[i].start < past_boundary_ms) {
    this.song.keys[i].available = false;
    deadkeys.push(i);
    this.last_key_index = i;
    i++;
  }
  return callback && callback(undefined, deadkeys);
};

// Client can tell the server the user just pressed a key
Performance.prototype.press_key = function(pitch, ms, callback) {
  var self = this;
  this.status(ms, function(err, deadkeys) {
    var future_boundary_ms = ms + self.range;
    var i = self.last_key_index + 1;
    while (self.song.keys[i] && self.song.keys[i].start < future_boundary_ms) {
      var key = self.song.keys[i];
      if (key.pitch === pitch && key.available) {
        key.available = false;
        self.update_streak(1);
        return callback(undefined, i, deadkeys);
      }
      i++;
    }
    self.update_streak(-1);
    return callback && callback(undefined, undefined, deadkeys);  
  });
};

Performance.prototype.kill_key = function(i) {
  while(this.song.keys[i] && this.song.keys[i].available) {
    this.song.keys[i].available = false;
    i--;
  }
  this.last_key_index = i;
}

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
  if (this.streak > 10) this.send_tips(+3);
  else this.send_tips(+1);
  this.send_streak();
};

// Server can tell the client the user fucked up
Performance.prototype.send_fuckup = function(pitch) {
  this.emit('fuckedUp', this.player_id, pitch);
};

// Server can tell the client to update to user's streak
Performance.prototype.send_streak = function() {
  this.emit('updatedStreak', this.player_id, this.streak);
};

// Server can tell the client to update the user's tips
Performance.prototype.send_tips = function() {
  this.emit('updatedTips', this.player_id, this.tips);
};

exports = module.exports = Performance;


// Quick test

/*
var p = new Performance();

p.load_song('zuqJ1Q_px5k', function() {
console.log("song loaded:");
console.log(p.song);
});
*/